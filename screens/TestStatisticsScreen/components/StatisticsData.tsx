import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import { TableHeader } from "@/components/Table/TableHeader";
import { useTableHeader } from "@/hooks/useTableHeader";
import { TableRows } from "@/components/Table/TableRows";
import {
  initialTestStatisticsTableHeaderCols,
  MyTableHeaderColumn,
  TestStatisticsTableHeaderCol,
} from "../model";
import { observer } from "mobx-react";
import { CfIpStatistics, TestStatistics } from "@/store/TestStatistics";
import { SortType } from "@/typings";
import { sortByIp, sortByNumber } from "@/utils";

export const StatisticsData = observer(
  ({ testStatisticsStore }: { testStatisticsStore: TestStatistics }) => (
    <StatisticsDataInternal rows={testStatisticsStore.computedRecordList} />
  )
);
function sortTableData(
  dataList: CfIpStatistics[],
  colId: `${TestStatisticsTableHeaderCol}`,
  sortType: `${SortType}`
) {
  if (colId === TestStatisticsTableHeaderCol.RespondSuccessRate) {
    return sortByNumber(
      dataList,
      sortType,
      (obj) => obj.respondSuccessRate,
      (obj) => obj.respondSuccessCount === 0
    );
  }
  if (colId === TestStatisticsTableHeaderCol.MeanRespondTime) {
    return sortByNumber(
      dataList,
      sortType,
      (obj) => obj.meanRespondTime,
      (obj) => obj.respondSuccessCount === 0
    );
  }
  if (colId === TestStatisticsTableHeaderCol.DownloadSuccessRate) {
    return sortByNumber(
      dataList,
      sortType,
      (obj) => obj.downloadSuccessRate,
      (obj) => obj.downloadSuccessCount === 0
    );
  }
  if (colId === TestStatisticsTableHeaderCol.MeanDownloadSpeed) {
    return sortByNumber(
      dataList,
      sortType,
      (obj) => obj.meanDownloadSpeed,
      (obj) => obj.downloadSuccessCount === 0
    );
  }
  return sortByIp(dataList, sortType, (obj) => obj.ip);
}
function StatisticsDataInternal(props: { rows: CfIpStatistics[] }) {
  const { tableHeaders, changeTableHeadersSortType, getCurrentSortConf } =
    useTableHeader<MyTableHeaderColumn>(initialTestStatisticsTableHeaderCols);

  function onSort(
    colId: MyTableHeaderColumn["id"],
    sortType: MyTableHeaderColumn["sort"]
  ) {
    changeTableHeadersSortType(colId, sortType);
  }

  const { sortType, columnId } = getCurrentSortConf();
  // todo fix the type infer later
  const sortedRows = sortTableData(
    props.rows,
    columnId as `${TestStatisticsTableHeaderCol}`,
    sortType
  );

  return (
    <View style={styles.getStartedContainer}>
      <TableHeader
        style={{ cellTextStyle: styles.tableCell }}
        onSort={onSort}
        cols={tableHeaders}
      />
      <TableRows
        rows={sortedRows}
        columns={tableHeaders}
        rowKeyName={"ip"}
        style={{ cellTextStyle: styles.tableCell }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "column",
    alignSelf: "stretch",
    flex: 1,
    fontSize: 10,
  },
  tableCell: {
    fontSize: 12,
  },
});
