import { getInitialCfIpResponse } from "./../utils/index";
import { CfIpResponse } from "@/screens/TestRunScreen/model";
import { MyTableHeaderColumn } from "./../model";
import {
  getCfNodesResponseTestTime,
  getCfNodesDownloadTestTime,
} from "./../../../apis/index";
import { takeUntil } from "rxjs";
import { sortByIp } from "@/utils";
import { SortType, RequestStatus } from "@/typings/index";
import { useState } from "react";
import { sortByNumber } from "@/utils";
import { sortByString } from "@/utils";
import { responseTestService } from "@/services/ResponseTest.service";
import { downloadTestService } from "@/services/DownloadTest.service";
import { testStatisticsStore } from "@/store/TestStatistics";

export function useTableData() {
  const initialTableData: CfIpResponse[] = [];

  const [tableData, setTableData] = useState<CfIpResponse[]>(initialTableData);
  function reset() {
    setTableData(() => []);
  }

  function sortTableData(
    sortColId: MyTableHeaderColumn["id"],
    sortType: `${SortType}`
  ) {
    setTableData((prevTableData) => {
      if (sortType === SortType.Default) {
        const ret = sortByIp(
          prevTableData,
          SortType.Ascending,
          (item) => item.ip
        );
        return ret;
      }
      if (sortColId === "downloadSpeed") {
        const ret = sortByNumber<CfIpResponse>(
          prevTableData,
          sortType,
          (item) => item.downloadSpeed,
          (item) => item.downloadSpeedTestStatus !== RequestStatus.Success
        );
        return ret;
      }
      if (sortColId === "respondTime") {
        const ret = sortByNumber<CfIpResponse>(
          prevTableData,
          sortType,
          (item) => item.respondTime,
          (item) => item.respondTestStatus !== RequestStatus.Success
        );
        return ret;
      }
      if (sortColId === "packetLossRate") {
        const ret = sortByNumber<CfIpResponse>(
          prevTableData,
          sortType,
          (item) => item.packetLossRate,
          (item) => item.respondTestStatus !== RequestStatus.Success
        );
        return ret;
      }

      return prevTableData.slice();
    });
  }

  function startResponseSpeedTest(
    ipList: string[],
    coCurrentCount: number,
    testUrl: string
  ): void {
    resetResponseSpeedTest();
    getCfNodesResponseTestTime(ipList, coCurrentCount, testUrl)
      .pipe(takeUntil(responseTestService.start()))
      .subscribe((result) => {
        testStatisticsStore.addRecord(result);
        const index = tableData.findIndex((item) => item.ip === result.ip);
        if (index >= 0) {
          setTableData((prevTableData) => {
            const newTableData = prevTableData.slice();
            newTableData[index].packetLossRate = result.packetLossRate;
            newTableData[index].respondTime = result.respondTime;
            newTableData[index].respondTestStatus = result.respondTestStatus;
            return newTableData;
          });
          return;
        }
        setTableData((prevTableData) => {
          return [...prevTableData, result];
        });
      });
  }
  function startDownloadSpeedTest(
    ipList: string[],
    coCurrentCount: number,
    testUrl: string
  ) {
    resetDownloadSpeedTest();
    getCfNodesDownloadTestTime(ipList, coCurrentCount, testUrl)
      .pipe(takeUntil(downloadTestService.start()))
      .subscribe((result) => {
        const index = tableData.findIndex((item) => item.ip === result.ip);
        testStatisticsStore.addRecord(result);
        if (index >= 0) {
          setTableData((prevTableData) => {
            const newTableData = prevTableData.slice();
            newTableData[index].downloadSpeed = result.downloadSpeed;
            newTableData[index].downloadSpeedTestStatus =
              result.downloadSpeedTestStatus;

            return newTableData;
          });
          return;
        }
        setTableData((prevTableData) => {
          return [...prevTableData, result];
        });
      });
  }
  function getSelectedIpList() {
    return tableData.map((o) => o.ip);
  }
  function initTableData(ipList: string[]) {
    setTableData(() => {
      const newTableData: CfIpResponse[] = ipList.map((ip) => {
        return getInitialCfIpResponse(ip);
      });
      return newTableData;
    });
  }
  function resetResponseSpeedTest() {
    setTableData((prevTableData): CfIpResponse[] => {
      return prevTableData.map((row) => {
        return {
          ...row,
          respondTime: 0,
          responseTestStatus: RequestStatus.Uninitialized,
        };
      });
    });
  }
  function resetDownloadSpeedTest() {
    setTableData((prevTableData): CfIpResponse[] => {
      return prevTableData.map((row) => {
        return {
          ...row,
          meanDownloadSpeed: 0,
          speedTestStatus: RequestStatus.Uninitialized,
        };
      });
    });
  }
  return {
    tableData,
    setTableData,
    reset,
    sortTableData,
    startResponseSpeedTest,
    startDownloadSpeedTest,
    getSelectedIpList,
    initTableData,
  };
}
