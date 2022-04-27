import { TableHeaderColumn } from "@/components/Table/TableHeader";
export type MyTableHeaderColumn = TableHeaderColumn<
  | "ip"
  | "respondSuccessRate"
  | "meanRespondTime"
  | "downloadSuccessRate"
  | "meanDownloadSpeed"
>;

export const initialTestStatisticsTableHeaderCols: MyTableHeaderColumn[] = [
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