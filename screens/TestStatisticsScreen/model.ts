import { TableHeaderColumn } from "@/components/Table/TableHeader";
export type MyTableHeaderColumn = TableHeaderColumn<
  | "ip"
  | "respondSuccessRate"
  | "meanRespondTime"
  | "downloadSuccessRate"
  | "meanDownloadSpeed"
>;
