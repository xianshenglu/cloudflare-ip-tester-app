import { CfIpStatistics } from "./../../../store/TestStatistics";
import { MyTableHeaderColumn } from "./../model";
import { useState } from "react";
export function useTableHeader() {
  const initialTableHeaderCols: MyTableHeaderColumn[] = [
    { id: "ip", label: "IP", width: 60, sort: "default" },
    {
      id: "respondSuccessRate",
      label: "Respond Suc Rate",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpStatistics) {
        return Number.isNaN(row.respondSuccessRate)
          ? ""
          : `${row.respondSuccessRate}%`;
      },
    },
    {
      id: "meanRespondTime",
      label: "Mean Respond Time",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpStatistics) {
        return Number.isNaN(row.meanRespondTime) ? "" : row.meanRespondTime;
      },
    },
    {
      id: "downloadSuccessRate",
      label: "Download Suc Rate",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpStatistics) {
        return Number.isNaN(row.downloadSuccessRate)
          ? ""
          : `${row.downloadSuccessRate}%`;
      },
    },
    {
      id: "meanDownloadSpeed",
      label: "mean Download",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpStatistics) {
        return Number.isNaN(row.meanDownloadSpeed)
          ? ""
          : `${row.meanDownloadSpeed}MB/S`;
      },
    },
  ];
  const [tableHeaders, setTableHeaders] = useState<MyTableHeaderColumn[]>(
    initialTableHeaderCols
  );
  function changeTableHeadersSortType(
    id: MyTableHeaderColumn["id"],
    sortType: MyTableHeaderColumn["sort"]
  ): void {
    setTableHeaders((prevTableHeaderCols) => {
      const result = prevTableHeaderCols.map((item) => {
        const targetSortType = item.id === id ? sortType : "default";
        return {
          ...item,
          sort: targetSortType,
        };
      });

      return result;
    });
  }
  function reset() {
    setTableHeaders(() => initialTableHeaderCols);
  }

  return {
    tableHeaders,
    setTableHeaders,
    reset,
    changeTableHeadersSortType,
  };
}
