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
import { sortByIp, sortByNumber } from "@/utils/sorter";
import { useState } from "react";
import { Button } from "react-native-paper";
import { getStoredJson, storeJson } from "@/storage/localStorage";
import { AppI18n } from "@/localize";

export const STORAGE_KEY_USER_SETTINGS =
  "STORAGE_KEY_TEST_STATISTICS_USER_CONFIG";
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
  if (colId === TestStatisticsTableHeaderCol.TotalRespondCount) {
    return sortByNumber(dataList, sortType, (obj) => obj.totalRespondCount);
  }
  if (colId === TestStatisticsTableHeaderCol.TotalDownloadCount) {
    return sortByNumber(dataList, sortType, (obj) => obj.totalDownloadCount);
  }
  return sortByIp(dataList, sortType, (obj) => obj.ip);
}
function getFilteredTableHeaders(
  originalTableHeaders: MyTableHeaderColumn[],
  isShowAllHeader: boolean
) {
  if (isShowAllHeader) {
    return originalTableHeaders;
  }
  return originalTableHeaders.filter(
    (column) =>
      column.id !== TestStatisticsTableHeaderCol.TotalRespondCount &&
      column.id !== TestStatisticsTableHeaderCol.TotalDownloadCount
  );
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
  const [isShowAllData, setIsShowAllData] = useState<boolean>(false);

  const PERFORMANCE_LIMIT = 50;

  // todo fix the type infer later
  const sortedRows = sortTableData(
    props.rows,
    columnId as `${TestStatisticsTableHeaderCol}`,
    sortType
  ).slice(0, isShowAllData ? props.rows.length : PERFORMANCE_LIMIT);

  const [isShowAllHeader, setIsShowAllHeader] = useState<boolean>(false);

  let filteredTableHeaders = getFilteredTableHeaders(
    tableHeaders,
    isShowAllHeader
  );

  getStoredJson<Record<string, any>>(STORAGE_KEY_USER_SETTINGS, {}).then(
    ({ isShowAllHeader, isShowAllData }) => {
      setIsShowAllHeader(() => !!isShowAllHeader);
      setIsShowAllData(() => !!isShowAllData);
    }
  );

  function onIsShowAllHeaderChange(isShowAllHeader: boolean) {
    setIsShowAllHeader((isShowAllHeader) => !isShowAllHeader);
    storeJson(STORAGE_KEY_USER_SETTINGS, { isShowAllHeader });
  }
  function onIsShowAllDataChange(isShowAllData: boolean) {
    setIsShowAllData((isShowAllData) => !isShowAllData);
    storeJson(STORAGE_KEY_USER_SETTINGS, { isShowAllData });
  }

  return (
    <View style={styles.getStartedContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          marginBottom: 10,
        }}
      >
        <Button
          mode="contained"
          contentStyle={{ marginHorizontal: -5, marginVertical: -2 }}
          style={{ marginRight: 10 }}
          onPress={() => onIsShowAllHeaderChange(!isShowAllHeader)}
        >
          {isShowAllHeader
            ? AppI18n.t("testStatistics.hideSomeColumns")
            : AppI18n.t("testStatistics.showAllColumns")}
        </Button>
        <Button
          mode="contained"
          contentStyle={{ marginHorizontal: -5, marginVertical: -2 }}
          onPress={() => onIsShowAllDataChange(!isShowAllData)}
        >
          {isShowAllData
            ? AppI18n.t("general.showSortedTop") + PERFORMANCE_LIMIT
            : AppI18n.t("general.showAllData")}
        </Button>
      </View>

      <TableHeader
        style={{ cellTextStyle: styles.tableCell }}
        onSort={onSort}
        cols={filteredTableHeaders}
      />
      <TableRows
        rows={sortedRows}
        columns={filteredTableHeaders}
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
