import { RequestStatus } from "@/typings/index";
import { TableHeaderColumn } from "@/components/Table/TableHeader";
export type CfIpResponse = {
  ip: string;
  respondTime?: number;
  downloadSpeed?: number;
  respondTestStatus?: `${RequestStatus}`;
  downloadSpeedTestStatus?: `${RequestStatus}`;
  packetLossRate: number;
};

export type MyTableHeaderColumn = TableHeaderColumn<
  "ip" | "packetLossRate" | "respondTime" | "downloadSpeed"
>;

export const initialTestPageTableHeaderCols: MyTableHeaderColumn[] = [
  { id: "ip", label: "IP", width: 60, sort: "default" },
  {
    id: "packetLossRate",
    label: "Loss Rate",
    width: 40,
    sort: "default",
    // @ts-ignore
    formatter(row: CfIpResponse) {
      const isFinished =
        row.respondTestStatus === RequestStatus.Success ||
        row.respondTestStatus === RequestStatus.Error;
      return isFinished ? `${row.packetLossRate}%` : "";
    },
  },
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
