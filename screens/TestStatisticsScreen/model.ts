import { AppI18n } from "@/localize";
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
  { id: "ip", label: AppI18n.t("general.ip"), width: 60, sort: "default" },
  {
    id: "totalRespondCount",
    label: AppI18n.t("testStatistics.totalRespond"),
    width: 25,
    sort: "default",
  },
  {
    id: "respondSuccessRate",
    label: AppI18n.t("testStatistics.respondSuccessRate"),
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
    label: AppI18n.t("testStatistics.meanRespondTime") + "(s)",
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
    label: AppI18n.t("testStatistics.totalDownload"),
    width: 25,
    sort: "default",
  },
  {
    id: "downloadSuccessRate",
    label: AppI18n.t("testStatistics.downloadSuccessRate"),
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
    label: AppI18n.t("testStatistics.meanDownload") + "(MB/s)",
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
