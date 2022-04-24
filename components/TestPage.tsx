import * as WebBrowser from "expo-web-browser";
import {
  StyleSheet,
  TouchableOpacity,
  Button,
  Pressable,
  VirtualizedList,
  TextInput,
} from "react-native";
import {
  getCfNodesDownloadTestTime,
  getCfNodesResponseTestTime,
  getRandomCfIpList,
} from "../apis";
import Colors from "../constants/Colors";
import { MonoText } from "./StyledText";
import { Text, View } from "./Themed";
import { Fragment, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Subject, takeUntil } from "rxjs";
import { responseTestService } from "../services/ResponseTest.service";
import { downloadTestService } from "../services/DownloadTest.service";
export type CfIpResponse = {
  ip: string;
  meanRespond?: number;
  col?: string;
  meanDownloadSpeed?: number;
  hasError: boolean;
  responseTestStatus?: "UNINITIALIZED" | "SUCCESS" | "ERROR" | "PENDING";
  speedTestStatus?: "UNINITIALIZED" | "SUCCESS" | "ERROR" | "PENDING";
};

type TableHeaderColumn = {
  id: "ip" | "meanRespond" | "col" | "meanDownloadSpeed";
  label: string;
  width: number;
  sort: "ascending" | "descending" | "default";
};
function TableRow(props: { row: CfIpResponse; columns: TableHeaderColumn[] }) {
  const { row, columns } = props;
  const meanRespondSpeedMap: Record<
    // @ts-ignore
    CfIpResponse["responseTestStatus"],
    number | string | undefined
  > = {
    UNINITIALIZED: "",
    SUCCESS: row.meanRespond,
    ERROR: "Error",
    PENDING: "...",
  };
  // @ts-ignore

  let meanRespond = meanRespondSpeedMap[row.responseTestStatus];

  const meanDownloadSpeedMap: Record<
    // @ts-ignore

    CfIpResponse["speedTestStatus"],
    number | string | undefined
  > = {
    UNINITIALIZED: "",
    SUCCESS: row.meanDownloadSpeed,
    ERROR: "Error",
    PENDING: "...",
  };
  // @ts-ignore

  let meanDownloadSpeed = meanDownloadSpeedMap[row.speedTestStatus];

  return (
    <View
      style={{
        ...styles.tableHeader,
        justifyContent: "center",
      }}
      key={row.ip}
    >
      <View
        style={{
          flex: columns[0].width,
          flexBasis: columns[0].width,
          ...styles.tableCell,
        }}
      >
        <Text>{row.ip}</Text>
      </View>

      <View
        style={{
          flex: columns[1].width,
          flexBasis: columns[1].width,
          ...styles.tableCell,
        }}
      >
        <Text>{row.col}</Text>
      </View>
      <View
        style={{
          flex: columns[2].width,
          flexBasis: columns[2].width,
          ...styles.tableCell,
        }}
      >
        <Text>{meanRespond}</Text>
      </View>
      <View
        style={{
          flex: columns[3].width,
          flexBasis: columns[3].width,
          ...styles.tableCell,
        }}
      >
        <Text>
          {meanDownloadSpeed}{" "}
          {typeof meanDownloadSpeed === "number" ? "MB/S" : ""}
        </Text>
      </View>
    </View>
  );
}
function TableRows(props: {
  rows: CfIpResponse[];
  columns: TableHeaderColumn[];
}) {
  const { rows, columns } = props;
  return (
    <SafeAreaView
      // https://github.com/th3rdwave/react-native-safe-area-context/issues/167#issuecomment-883604754
      edges={["bottom", "left", "right"]}
      style={{
        flex: 1,
        flexDirection: "column",
        alignSelf: "stretch",
      }}
    >
      <VirtualizedList
        style={{}}
        data={rows}
        initialNumToRender={20}
        renderItem={({ item }: { item: CfIpResponse }) => (
          <TableRow row={item} columns={columns} />
        )}
        keyExtractor={(item: CfIpResponse) => item.ip}
        getItemCount={() => rows.length}
        getItem={(data, index) => rows[index]}
      />
    </SafeAreaView>
  );
}

function TableHeader(props: {
  cols: TableHeaderColumn[];
  onSort: (
    id: TableHeaderColumn["id"],
    sortType: TableHeaderColumn["sort"]
  ) => void;
}) {
  const { cols, onSort } = props;
  const sortIconNameMap: Record<
    TableHeaderColumn["sort"],
    "sort-asc" | "sort-desc" | "info"
  > = {
    ascending: "sort-asc",
    descending: "sort-desc",
    default: "info",
  };
  const nextSortTypeMap: Record<
    TableHeaderColumn["sort"],
    TableHeaderColumn["sort"]
  > = {
    default: "ascending",
    ascending: "descending",
    descending: "default",
  };

  return (
    <View style={styles.tableHeader}>
      {cols.map((column) => {
        return (
          <Pressable
            onPress={() => onSort(column.id, nextSortTypeMap[column.sort])}
            key={column.id}
            style={{
              flex: column.width,
              flexBasis: column.width,
              ...styles.tableHeaderCell,
            }}
          >
            <Text style={styles.tableHeaderCellText}> {column.label}</Text>
            <FontAwesome
              name={sortIconNameMap[column.sort]}
              size={12}
              style={{ marginLeft: 5 }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
function useTableHeader() {
  const initialTableHeaderCols: TableHeaderColumn[] = [
    { id: "ip", label: "IP", width: 60, sort: "default" },
    { id: "col", label: "Col", width: 20, sort: "default" },
    {
      id: "meanRespond",
      label: "Mean Respond Time",
      width: 40,
      sort: "default",
    },
    {
      id: "meanDownloadSpeed",
      label: "Mean Download Speed",
      width: 40,
      sort: "default",
    },
  ];
  const [tableHeaders, setTableHeaders] = useState<TableHeaderColumn[]>(
    initialTableHeaderCols
  );
  function changeTableHeadersSortType(
    id: TableHeaderColumn["id"],
    sortType: TableHeaderColumn["sort"]
  ): void {
    setTableHeaders((prevTableHeaderCols) => {
      const result = prevTableHeaderCols.map((item) => {
        const targetSortType = item.id === id ? sortType : "default";
        return {
          ...item,
          sort: targetSortType,
        };
      });

      return result;
    });
  }
  function reset() {
    setTableHeaders(initialTableHeaderCols);
  }

  return { tableHeaders, setTableHeaders, reset, changeTableHeadersSortType };
}
function useTableData() {
  const initialTableData: CfIpResponse[] = [];

  const [tableData, setTableData] = useState<CfIpResponse[]>(initialTableData);
  function reset() {
    setTableData([]);
  }
  function sortTableData(
    colId: TableHeaderColumn["id"],
    sortType: TableHeaderColumn["sort"]
  ) {
    setTableData((prevTableData) => {
      const sortColId = sortType === "default" ? "ip" : colId;
      const result = prevTableData.slice().sort((itemA, itemB) => {
        if (itemA[sortColId] && itemB[sortColId]) {
          const isLess = (itemA[sortColId] as any) < (itemB[sortColId] as any);
          if (
            (isLess && sortType === "ascending") ||
            (!isLess && sortType === "descending")
          ) {
            return -1;
          }
          return 1;
        }
        return 0;
      });

      return result;
    });
  }

  function startResponseSpeedTest(
    ipList: string[],
    coCurrentCount: number,
    testUrl: string
  ): void {
    getCfNodesResponseTestTime(ipList, coCurrentCount, testUrl)
      .pipe(takeUntil(responseTestService.start()))
      .subscribe((result) => {
        const index = tableData.findIndex((item) => item.ip === result.ip);
        if (index >= 0) {
          setTableData((prevTableData) => {
            const newTableData = prevTableData.slice();
            newTableData[index].meanRespond = result.meanRespond;
            newTableData[index].responseTestStatus = result.responseTestStatus;
            return newTableData;
          });
          return;
        }
        setTableData((prevTableData) => {
          return [...prevTableData, result];
        });
      });
  }
  function startDownloadSpeedTest(
    ipList: string[],
    coCurrentCount: number,
    testUrl: string
  ) {
    getCfNodesDownloadTestTime(ipList, coCurrentCount, testUrl)
      .pipe(takeUntil(downloadTestService.start()))
      .subscribe((result) => {
        const index = tableData.findIndex((item) => item.ip === result.ip);
        if (index >= 0) {
          setTableData((prevTableData) => {
            const newTableData = prevTableData.slice();
            newTableData[index].meanDownloadSpeed = result.meanDownloadSpeed;
            newTableData[index].speedTestStatus = result.speedTestStatus;

            return newTableData;
          });
          return;
        }
        setTableData((prevTableData) => {
          return [...prevTableData, result];
        });
      });
  }
  function getSelectedIpList() {
    return tableData.map((o) => o.ip);
  }
  function initTableData(ipList: string[]) {
    setTableData(() => {
      const newTableData: CfIpResponse[] = ipList.map((ip) => {
        return {
          ip,
          hasError: false,
          meanRespond: 0,
          responseTestStatus: "UNINITIALIZED",
          speedTestStatus: "UNINITIALIZED",
          meanDownloadSpeed: 0,
        };
      });
      return newTableData;
    });
  }
  return {
    tableData,
    setTableData,
    reset,
    sortTableData,
    startResponseSpeedTest,
    startDownloadSpeedTest,
    getSelectedIpList,
    initTableData,
  };
}
function useTestIpCount() {
  const [testIpCount, setTestIpCount] = useState<string>("20");

  const getIpList = () => getRandomCfIpList(Number(testIpCount));
  return { testIpCount, setTestIpCount, getIpList };
}
export default function TestPage({ path }: { path: string }) {
  const { testIpCount, setTestIpCount, getIpList } = useTestIpCount();
  const [testIpCoCurrentCount, setTestIpCoCurrentCount] = useState<string>("5");
  const [testUrl, setTestUrl] = useState<string>(
    // "http://cachefly.cachefly.net/200mb.test"
    // "http://v2ray.xianshenglu.xyz"
    "http://ip.flares.cloud/img/m.webp"
  );

  const {
    tableData,
    reset: resetTableData,
    sortTableData,
    startResponseSpeedTest,
    startDownloadSpeedTest,
    getSelectedIpList,
    initTableData,
  } = useTableData();

  const {
    tableHeaders,
    reset: resetTableHeader,
    changeTableHeadersSortType,
  } = useTableHeader();

  function onReset() {
    responseTestService.stop();
    downloadTestService.stop();
    resetTableData();
    resetTableHeader();
    initTableData(getIpList());
  }
  function onSort(
    colId: TableHeaderColumn["id"],
    sortType: TableHeaderColumn["sort"]
  ) {
    changeTableHeadersSortType(colId, sortType);
    sortTableData(colId, sortType);
  }
  function onTestIpCountChange(v: string) {
    setTestIpCount(v);
    initTableData(getIpList());
  }
  console.log(tableData.slice(0, 1));

  // initTableData(getIpList());
  return (
    <View style={styles.getStartedContainer}>
      <View style={styles.toolbar}>
        <Button
          onPress={() =>
            startResponseSpeedTest(
              getSelectedIpList(),
              Number(testIpCoCurrentCount),
              testUrl
            )
          }
          title="TEST RESPOND "
        />
        <View style={{ marginRight: 10 }}></View>
        <Button
          onPress={() =>
            startDownloadSpeedTest(
              getSelectedIpList(),
              Number(testIpCoCurrentCount),
              testUrl
            )
          }
          title="TEST DOWNLOAD"
        />
        <View style={{ marginRight: 10 }}></View>
        <Button onPress={onReset} title="RESET" />
      </View>
      <View style={styles.toolbar}>
        <Text>ip count</Text>
        <TextInput
          style={styles.input}
          onChangeText={onTestIpCountChange}
          value={testIpCount}
          placeholder="test how many ips"
          keyboardType="numeric"
        />
        <Text>coCurrent count</Text>
        <TextInput
          style={styles.input}
          onChangeText={setTestIpCoCurrentCount}
          value={testIpCoCurrentCount}
          placeholder="test how many ips"
          keyboardType="numeric"
        />
      </View>
      <View style={styles.toolbar}>
        <Text>test url</Text>
        <TextInput
          style={{ ...styles.input, flex: 1 }}
          onChangeText={setTestUrl}
          value={testUrl}
          placeholder="test how many ips"
          keyboardType="numeric"
        />
      </View>

      <TableHeader onSort={onSort} cols={tableHeaders} />
      <TableRows rows={tableData} columns={tableHeaders} />
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
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    width: 60,
    marginHorizontal: 10,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  tableHeader: {
    flex: 0,
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  tableHeaderCell: {
    flexDirection: "row",
    borderLeftWidth: 0.5,
    borderTopWidth: 0.5,
    paddingHorizontal: 3,
    paddingVertical: 3,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e6f6fa",
  },
  tableHeaderCellText: {
    lineHeight: 18,
    textAlign: "center",
  },
  tableCell: {
    paddingHorizontal: 3,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    borderLeftWidth: 0.5,
    borderBottomWidth: 0.5,
  },
});
