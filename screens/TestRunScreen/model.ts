import { RequestStatus } from "@/typings/index";
import { TableHeaderColumn } from "@/components/Table/TableHeader";
export type CfIpResponse = {
  ip: string;
  meanRespond?: number;
  col?: string;
  meanDownloadSpeed?: number;
  responseTestStatus?: `${RequestStatus}`;
  speedTestStatus?: `${RequestStatus}`;
};

export type MyTableHeaderColumn = TableHeaderColumn<
  "ip" | "meanRespond" | "col" | "meanDownloadSpeed"
>;
