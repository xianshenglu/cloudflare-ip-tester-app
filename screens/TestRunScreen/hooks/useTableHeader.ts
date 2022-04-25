import { MyTableHeaderColumn, CfIpResponse } from "./../model";
import { useState } from "react";
export function useTableHeader() {
  const initialTableHeaderCols: MyTableHeaderColumn[] = [
    { id: "ip", label: "IP", width: 60, sort: "default" },
    { id: "col", label: "Col", width: 20, sort: "default" },
    {
      id: "meanRespond",
      label: "Mean Respond Time",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpResponse) {
        const meanRespondSpeedMap: Record<
          // @ts-ignore
          CfIpResponse["responseTestStatus"],
          number | string | undefined
        > = {
          UNINITIALIZED: "",
          SUCCESS: row.meanRespond,
          ERROR: "Error",
          PENDING: "...",
        };
        // @ts-ignore

        let meanRespond = meanRespondSpeedMap[row.responseTestStatus];

        return meanRespond;
      },
    },
    {
      id: "meanDownloadSpeed",
      label: "Mean Download Speed",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpResponse, column: MyTableHeaderColumn) {
        const meanDownloadSpeedMap: Record<
          // @ts-ignore

          CfIpResponse["speedTestStatus"],
          number | string | undefined
        > = {
          UNINITIALIZED: "",
          SUCCESS: row.meanDownloadSpeed,
          ERROR: "Error",
          PENDING: "...",
        };
        // @ts-ignore

        let meanDownloadSpeed = meanDownloadSpeedMap[row.speedTestStatus];
        const result =
          typeof meanDownloadSpeed === "number"
            ? meanDownloadSpeed + "MB/S"
            : "";
        return result;
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
    setTableHeaders(initialTableHeaderCols);
  }

  return { tableHeaders, setTableHeaders, reset, changeTableHeadersSortType };
}
