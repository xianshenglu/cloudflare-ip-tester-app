import { round } from "lodash-es";
import { RequestStatus } from "./../typings/index";
import { CfIpResponse } from "@/screens/TestRunScreen/model";
import { makeAutoObservable } from "mobx";

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
  count: number;
  meanRespondTime: number;
  meanDownloadSpeed: number;
  respondSuccessRate: number;
  downloadSuccessRate: number;
};

export class TestStatistics {
  private statistics: Record<string, CfIpSummary> = {};

  constructor() {
    makeAutoObservable(this);
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
  getRecord(ip: string) {
    return this.statistics[ip];
  }
  getRawRecordList() {
    return Object.values(this.statistics);
  }
  getComputedRecordList(): CfIpStatistics[] {
    const result = this.getRawRecordList().map((cfIpSummary) => {
      const totalRespondCount =
        cfIpSummary.respondSuccessCount + cfIpSummary.respondFailCount;
      const totalDownloadCount =
        cfIpSummary.downloadSuccessCount + cfIpSummary.downloadFailCount;
      return {
        ...cfIpSummary,
        count: cfIpSummary.respondSuccessCount + cfIpSummary.respondFailCount,
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
  isRecordRespondSuccess(cfIpResponse: CfIpResponse) {
    return cfIpResponse.respondTestStatus === RequestStatus.Success;
  }
  isRecordRespondFail(cfIpResponse: CfIpResponse) {
    return cfIpResponse.respondTestStatus === RequestStatus.Error;
  }
  isRecordDownloadSuccess(cfIpResponse: CfIpResponse) {
    return cfIpResponse.downloadSpeedTestStatus === RequestStatus.Success;
  }
  isRecordDownloadFail(cfIpResponse: CfIpResponse) {
    return cfIpResponse.downloadSpeedTestStatus === RequestStatus.Error;
  }
}

export const testStatisticsStore = new TestStatistics();
