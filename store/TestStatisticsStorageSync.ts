import { IDisposer, deepObserve } from "mobx-utils";
import { STATISTICS_FILEPATH, readFile, writeFile } from "@/storage/fileAccess";
import { getStoredJson, storeJson } from "@/storage/localStorage";
import { uniq, round, debounce } from "lodash-es";
import { CfIpStatisticsMap, CfIpSummary } from "./TestStatistics";
import { StorageSync } from "./StorageSync";
const STORAGE_KEY_TEST_STATISTICS = "cf-ip-tester-app__test-statistics";

export class TestStatisticsStorageSync implements StorageSync {
  private filePath = STATISTICS_FILEPATH;

  private unsubscribeSaveToLocalStorage: IDisposer | undefined;
  private unsubscribeSaveToDevice: IDisposer | undefined;
  private statistics: CfIpStatisticsMap;

  constructor(data: CfIpStatisticsMap) {
    this.statistics = data;
  }

  public async mergedDeviceDataWithStorage() {
    const deviceData = await this.getDeviceData();
    const storageData = await getStoredJson<CfIpStatisticsMap>(
      STORAGE_KEY_TEST_STATISTICS,
      {}
    );
    const statistics = this.getDeviceStorageMergedData(deviceData, storageData);
    return statistics;
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
  public async getDeviceData(): Promise<CfIpStatisticsMap> {
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
  public async resetDeviceData() {
    await writeFile(this.filePath, "");
  }
  public async resetStorageData() {
    await storeJson(STORAGE_KEY_TEST_STATISTICS, {});
  }
  public async autoSaveToLocalStorage() {
    const result = await this.mergedDeviceDataWithStorage();
    this.unsubscribeSaveToLocalStorage = deepObserve(this.statistics, () => {
      storeJson(STORAGE_KEY_TEST_STATISTICS, this.statistics);
    });
    return result;
  }
  public async autoSaveToDevice() {
    const result = await this.mergedDeviceDataWithStorage();
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
    return result;
  }
  public async changeStoragePlace(isSaveDataToDevice: boolean) {
    if (isSaveDataToDevice) {
      const result = await this.autoSaveToDevice();
      this.unsubscribeSaveToLocalStorage?.();
      this.resetStorageData();
      return result;
    }
    const result = await this.autoSaveToLocalStorage();
    this.unsubscribeSaveToDevice?.();
    this.resetDeviceData();
    return result;
  }
  public async clear() {
    await this.resetDeviceData();
    await this.resetStorageData();
  }
}
