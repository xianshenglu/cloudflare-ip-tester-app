import { userSettingsStore } from "@/store/UserSettings";
import { readFile, STATISTICS_FILEPATH, writeFile } from "./../storage/fileAccess";
import { getStoredJson, storeJson } from "@/storage/localStorage";
import { debounce, round, uniq } from "lodash-es";
import { RequestStatus } from "./../typings/index";
import { CfIpResponse } from "@/screens/TestRunScreen/model";
import { deepObserve, IDisposer } from "mobx-utils";
import { action, computed, makeObservable, observable, reaction } from "mobx";
export type CfIpSummary = {
  ip: string;
  respondSuccessCount: number;
  respondFailCount: number;
  totalRespondTime: number;
  downloadSuccessCount: number;
  downloadFailCount: number;
  totalDownloadSpeed: number;
};

export type CfIpStatistics = CfIpSummary & {
  totalRespondCount: number;
  totalDownloadCount: number;
  meanRespondTime: number;
  meanDownloadSpeed: number;
  respondSuccessRate: number;
  downloadSuccessRate: number;
};
export type CfIpStatisticsMap = Record<string, CfIpSummary>;
const STORAGE_KEY_TEST_STATISTICS = "cf-ip-tester-app__test-statistics";
export class TestStatistics {
  statistics: CfIpStatisticsMap = {};
  private unsubscribeSaveToLocalStorage: IDisposer | undefined;
  private unsubscribeSaveToDevice: IDisposer | undefined;
  private filePath = STATISTICS_FILEPATH;

  public get computedRecordList(): CfIpStatistics[] {
    const result = this.getRawRecordList().map((cfIpSummary) => {
      const totalRespondCount =
        cfIpSummary.respondSuccessCount + cfIpSummary.respondFailCount;
      const totalDownloadCount =
        cfIpSummary.downloadSuccessCount + cfIpSummary.downloadFailCount;
      return {
        ...cfIpSummary,
        totalRespondCount,
        totalDownloadCount,
        meanRespondTime: round(
          cfIpSummary.totalRespondTime / cfIpSummary.respondSuccessCount,
          0
        ),
        // MB, so keep 2 decimal
        meanDownloadSpeed: round(
          cfIpSummary.totalDownloadSpeed / cfIpSummary.downloadSuccessCount,
          2
        ),
        respondSuccessRate: round(
          (100 * cfIpSummary.respondSuccessCount) / totalRespondCount,
          0
        ),
        downloadSuccessRate: round(
          (100 * cfIpSummary.downloadSuccessCount) / totalDownloadCount,
          0
        ),
      };
    });
    return result;
  }
  constructor() {
    makeObservable(this, {
      statistics: observable,
      computedRecordList: computed,
      changeStatistics: action,
      addRecord: action,
      updateRecord: action,
    });
    this.mergedDeviceDataWithStorage()
      .catch((err) => {
        console.log(err, "merge statistics failed");
      })
      .then(() => {
        reaction(
          () => userSettingsStore.userSetting.isSaveDataToDevice,
          this.onSavingDataToDeviceChange.bind(this),
          { fireImmediately: true }
        );
      });
  }
  private async onSavingDataToDeviceChange(isSaveDataToDevice: boolean) {
    if (isSaveDataToDevice) {
      await this.autoSaveToDevice();
      this.unsubscribeSaveToLocalStorage?.();
      this.resetStorageData();
      return;
    }
    this.autoSaveToLocalStorage();
    this.unsubscribeSaveToDevice?.();
    this.resetDeviceData();
  }
  private async resetDeviceData() {
    await writeFile(this.filePath, "");
  }
  private async resetStorageData() {
    await storeJson(STORAGE_KEY_TEST_STATISTICS, {});
  }
  private autoSaveToLocalStorage() {
    this.unsubscribeSaveToLocalStorage = deepObserve(this.statistics, () => {
      storeJson(STORAGE_KEY_TEST_STATISTICS, this.statistics);
    });
  }
  private async autoSaveToDevice() {
    await this.mergedDeviceDataWithStorage();
    this.unsubscribeSaveToDevice = deepObserve(
      this.statistics,
      debounce(
        () => {
          writeFile(this.filePath, JSON.stringify(this.statistics));
        },
        3000,
        { leading: true, trailing: true, maxWait: 5000 }
      )
    );
  }
  private async mergedDeviceDataWithStorage() {
    const deviceData = await this.getDeviceData();
    const storageData = await getStoredJson<CfIpStatisticsMap>(
      STORAGE_KEY_TEST_STATISTICS,
      {}
    );
    const statistics = this.getDeviceStorageMergedData(deviceData, storageData);

    this.changeStatistics(statistics);
  }
  private getDeviceStorageMergedData(
    statisticsMapA: CfIpStatisticsMap,
    statisticsMapB: CfIpStatisticsMap
  ): CfIpStatisticsMap {
    const resultMap: CfIpStatisticsMap = {};
    const uniqueKeys = uniq([
      ...Object.keys(statisticsMapA),
      ...Object.keys(statisticsMapB),
    ]);
    uniqueKeys.forEach((key) => {
      const mapAValue = statisticsMapA[key];
      const mapBValue = statisticsMapB[key];
      if (!mapAValue) {
        resultMap[key] = mapBValue;
        return;
      }
      if (!mapBValue) {
        resultMap[key] = mapAValue;
        return;
      }
      resultMap[key] = this.mergeStatisticsWithSameKeys(mapAValue, mapBValue);
    });
    return resultMap;
  }
  private mergeStatisticsWithSameKeys(
    statisticsA: CfIpSummary,
    statisticsB: CfIpSummary
  ): CfIpSummary {
    return {
      ip: statisticsA.ip,
      respondSuccessCount:
        statisticsA.respondSuccessCount + statisticsB.respondSuccessCount,
      respondFailCount:
        statisticsA.respondFailCount + statisticsB.respondFailCount,
      totalRespondTime:
        statisticsA.totalRespondTime + statisticsB.totalRespondTime,
      downloadSuccessCount:
        statisticsA.downloadSuccessCount + statisticsB.downloadSuccessCount,
      downloadFailCount:
        statisticsA.downloadFailCount + statisticsB.downloadFailCount,
      totalDownloadSpeed: round(
        statisticsA.totalDownloadSpeed + statisticsB.totalDownloadSpeed,
        4
      ),
    };
  }
  private async getDeviceData(): Promise<CfIpStatisticsMap> {
    const jsonStr = await readFile(this.filePath);
    if (!jsonStr) {
      return {};
    }
    let result = {};
    try {
      result = JSON.parse(jsonStr);
    } catch (error) {
      return {};
    }
    return result;
  }
  isRecordExist(cfIpResponse: CfIpResponse) {
    return !!this.statistics[cfIpResponse.ip];
  }
  addRecord(cfIpResponse: CfIpResponse) {
    if (this.isRecordExist(cfIpResponse)) {
      this.updateRecord(cfIpResponse);
      return;
    }
    this.statistics[cfIpResponse.ip] = {
      ip: cfIpResponse.ip,
      respondSuccessCount: this.isRecordRespondSuccess(cfIpResponse) ? 1 : 0,
      respondFailCount: this.isRecordRespondFail(cfIpResponse) ? 1 : 0,
      downloadSuccessCount: this.isRecordDownloadSuccess(cfIpResponse) ? 1 : 0,
      downloadFailCount: this.isRecordDownloadFail(cfIpResponse) ? 1 : 0,
      totalRespondTime: this.isRecordRespondSuccess(cfIpResponse)
        ? cfIpResponse.respondTime!
        : 0,
      totalDownloadSpeed: this.isRecordDownloadSuccess(cfIpResponse)
        ? cfIpResponse.downloadSpeed!
        : 0,
    };
  }
  updateRecord(cfIpResponse: CfIpResponse) {
    if (!this.isRecordExist(cfIpResponse)) {
      this.addRecord(cfIpResponse);
      return;
    }
    const record = this.getRecord(cfIpResponse.ip);
    if (this.isRecordRespondSuccess(cfIpResponse)) {
      record.respondSuccessCount++;
      record.totalRespondTime += cfIpResponse.respondTime!;
    } else {
      record.respondFailCount++;
    }
    if (this.isRecordDownloadSuccess(cfIpResponse)) {
      record.downloadSuccessCount++;
      record.totalDownloadSpeed += cfIpResponse.downloadSpeed!;
    } else {
      record.downloadFailCount++;
    }
  }
  private getRecord(ip: string) {
    return this.statistics[ip];
  }
  changeStatistics(statistics: CfIpStatisticsMap) {
    this.statistics = statistics;
  }
  private getRawRecordList() {
    return Object.values(this.statistics);
  }
  private isRecordRespondSuccess(cfIpResponse: CfIpResponse) {
    return cfIpResponse.respondTestStatus === RequestStatus.Success;
  }
  private isRecordRespondFail(cfIpResponse: CfIpResponse) {
    return cfIpResponse.respondTestStatus === RequestStatus.Error;
  }
  private isRecordDownloadSuccess(cfIpResponse: CfIpResponse) {
    return cfIpResponse.downloadSpeedTestStatus === RequestStatus.Success;
  }
  private isRecordDownloadFail(cfIpResponse: CfIpResponse) {
    return cfIpResponse.downloadSpeedTestStatus === RequestStatus.Error;
  }
  public async clear() {
    await this.resetDeviceData();
    await this.resetStorageData();
  }
}

const testStatisticsStore = new TestStatistics();

export { testStatisticsStore };
