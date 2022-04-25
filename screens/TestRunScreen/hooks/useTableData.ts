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

export function useTableData() {
  const initialTableData: CfIpResponse[] = [];

  const [tableData, setTableData] = useState<CfIpResponse[]>(initialTableData);
  function reset() {
    setTableData([]);
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
      if (sortColId === "meanDownloadSpeed") {
        const ret = sortByNumber<CfIpResponse>(
          prevTableData,
          sortType,
          (item) => item.meanDownloadSpeed,
          (item) => item.speedTestStatus !== RequestStatus.Success
        );
        return ret;
      }
      if (sortColId === "meanRespond") {
        const ret = sortByNumber<CfIpResponse>(
          prevTableData,
          sortType,
          (item) => item.meanRespond,
          (item) => item.responseTestStatus !== RequestStatus.Success
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
    getCfNodesResponseTestTime(ipList, coCurrentCount, testUrl)
      .pipe(takeUntil(responseTestService.start()))
      .subscribe((result) => {
        const index = tableData.findIndex((item) => item.ip === result.ip);
        if (index >= 0) {
          setTableData((prevTableData) => {
            const newTableData = prevTableData.slice();
            newTableData[index].meanRespond = result.meanRespond;
            newTableData[index].responseTestStatus = result.responseTestStatus;
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
    getCfNodesDownloadTestTime(ipList, coCurrentCount, testUrl)
      .pipe(takeUntil(downloadTestService.start()))
      .subscribe((result) => {
        const index = tableData.findIndex((item) => item.ip === result.ip);
        if (index >= 0) {
          setTableData((prevTableData) => {
            const newTableData = prevTableData.slice();
            newTableData[index].meanDownloadSpeed = result.meanDownloadSpeed;
            newTableData[index].speedTestStatus = result.speedTestStatus;

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
        return {
          ip,
          meanRespond: 0,
          responseTestStatus: "UNINITIALIZED",
          speedTestStatus: "UNINITIALIZED",
          meanDownloadSpeed: 0,
        };
      });
      return newTableData;
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
