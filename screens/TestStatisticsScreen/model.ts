import { round } from "lodash-es";
import { TableHeaderColumn } from "@/components/Table/TableHeader";

export type MyTableHeaderColumn =
  TableHeaderColumn<`${TestStatisticsTableHeaderCol}`>;

export enum TestStatisticsTableHeaderCol {
  Ip = "ip",
  TotalRespondCount = "totalRespondCount",
  RespondSuccessRate = "respondSuccessRate",
  MeanRespondTime = "meanRespondTime",
  TotalDownloadCount = "totalDownloadCount",
  DownloadSuccessRate = "downloadSuccessRate",
  MeanDownloadSpeed = "meanDownloadSpeed",
}

export const initialTestStatisticsTableHeaderCols: MyTableHeaderColumn[] = [
  { id: "ip", label: "IP", width: 60, sort: "default" },
  {
    id: "totalRespondCount",
    label: "Total Respond",
    width: 25,
    sort: "default",
  },
  {
    id: "respondSuccessRate",
    label: "Respond Suc Rate",
    width: 25,
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
    label: "Mean Respond Time(S)",
    width: 25,
    sort: "default",
    // @ts-ignore
    formatter(row: CfIpStatistics) {
      return Number.isNaN(row.meanRespondTime)
        ? ""
        : round(row.meanRespondTime / 1000, 2);
    },
  },
  {
    id: "totalDownloadCount",
    label: "Total Download",
    width: 25,
    sort: "default",
  },
  {
    id: "downloadSuccessRate",
    label: "Download Suc Rate",
    width: 25,
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
    label: "mean Download(MB/S)",
    width: 25,
    sort: "default",
    // @ts-ignore
    formatter(row: CfIpStatistics) {
      return Number.isNaN(row.meanDownloadSpeed)
        ? ""
        : `${row.meanDownloadSpeed}`;
    },
  },
];
