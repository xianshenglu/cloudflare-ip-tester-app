import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";
import { TableHeader } from "@/components/Table/TableHeader";
import { useTableHeader } from "../hooks/useTableHeader";
import { TableRows } from "@/components/Table/TableRows";
import { MyTableHeaderColumn } from "../model";
import { observer } from "mobx-react";
import { TestStatistics, testStatisticsStore } from "@/store/TestStatistics";

export const StatisticsData = observer(
  ({ testStatisticsStore }: { testStatisticsStore: TestStatistics }) => (
    <StatisticsDataInternal testStatisticsStore={testStatisticsStore} />
  )
);

function StatisticsDataInternal(props: {
  testStatisticsStore: TestStatistics;
}) {
  //   const { tableData, sortTableData } = useTableData();

  const { tableHeaders, changeTableHeadersSortType } = useTableHeader();

  function onSort(
    colId: MyTableHeaderColumn["id"],
    sortType: MyTableHeaderColumn["sort"]
  ) {
    changeTableHeadersSortType(colId, sortType);
    // sortTableData(colId, sortType);
  }

  return (
    <View style={styles.getStartedContainer}>
      <TableHeader
        style={{ cellTextStyle: styles.tableHeader }}
        onSort={onSort}
        cols={tableHeaders}
      />
      <TableRows
        rows={testStatisticsStore.getComputedRecordList()}
        columns={tableHeaders}
        rowKeyName={"ip"}
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
  tableHeader: {
    fontSize: 10,
  },
});
