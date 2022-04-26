import { RequestStatus } from "@/typings/index";
import { TableHeaderColumn } from "@/components/Table/TableHeader";
export type CfIpResponse = {
  ip: string;
  respondTime?: number;
  downloadSpeed?: number;
  respondTestStatus?: `${RequestStatus}`;
  downloadSpeedTestStatus?: `${RequestStatus}`;
};

export type MyTableHeaderColumn = TableHeaderColumn<
  "ip" | "respondTime" | "downloadSpeed"
>;
