import { MyTableHeaderColumn, CfIpResponse } from "./../model";
import { useState } from "react";
export function useTableHeader() {
  const initialTableHeaderCols: MyTableHeaderColumn[] = [
    { id: "ip", label: "IP", width: 60, sort: "default" },
    {
      id: "respondTime",
      label: "Respond Time",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpResponse) {
        const meanRespondSpeedMap: Record<
          // @ts-ignore
          CfIpResponse["respondTestStatus"],
          number | string | undefined
        > = {
          UNINITIALIZED: "",
          SUCCESS: row.respondTime,
          ERROR: "Error",
          PENDING: "...",
        };
        // @ts-ignore

        let respondTime = meanRespondSpeedMap[row.respondTestStatus];

        return respondTime;
      },
    },
    {
      id: "downloadSpeed",
      label: "Download Speed",
      width: 40,
      sort: "default",
      // @ts-ignore
      formatter(row: CfIpResponse, column: MyTableHeaderColumn) {
        const downloadSpeedMap: Record<
          // @ts-ignore

          CfIpResponse["downloadSpeedTestStatus"],
          number | string | undefined
        > = {
          UNINITIALIZED: "",
          SUCCESS: row.downloadSpeed,
          ERROR: "Error",
          PENDING: "...",
        };
        // @ts-ignore

        let downloadSpeed = downloadSpeedMap[row.downloadSpeedTestStatus];
        const result =
          typeof downloadSpeed === "number" ? downloadSpeed + "MB/S" : "";
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
    setTableHeaders(() => initialTableHeaderCols);
  }

  return {
    tableHeaders,
    setTableHeaders,
    reset,
    changeTableHeadersSortType,
  };
}
