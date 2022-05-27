import { userSettingsStore } from "@/store/UserSettings";
import { round } from "lodash-es";
import { RequestStatus } from "./../typings/index";
import { CfIpResponse } from "@/screens/TestRunScreen/model";
import { action, computed, makeObservable, observable, reaction } from "mobx";
import { TestStatisticsStorageSync } from "./TestStatisticsStorageSync";
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

export class TestStatistics {
  readonly statistics: CfIpStatisticsMap = {};
  private storageSync: TestStatisticsStorageSync;

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
    this.storageSync = new TestStatisticsStorageSync(this.statistics);
    this.storageSync
      .mergedDeviceDataWithStorage()
      .then((statistics) => {
        this.changeStatistics(statistics);
        reaction(
          () => userSettingsStore.userSetting.isSaveDataToDevice,
          async (isSaveDataToDevice) => {
            const statistics = await this.storageSync.changeStoragePlace(
              isSaveDataToDevice
            );
            this.changeStatistics(statistics);
          },
          { fireImmediately: true }
        );
      })
      .catch((err) => {
        console.log(err, "merge statistics failed");
      });
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
  /**
   * @description keep the reference to make sure it trackable for other places, especially for TestStatisticsStorageSync. Seems not a good way, except provide vm to TestStatisticsStorageSync
   */
  changeStatistics(statistics: CfIpStatisticsMap) {
    Object.keys(this.statistics).forEach((key) => {
      delete this.statistics[key];
    });
    Object.keys(statistics).forEach((key) => {
      this.statistics[key] = statistics[key];
    });
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
    await this.storageSync.clear();
  }
}

const testStatisticsStore = new TestStatistics();

export { testStatisticsStore };