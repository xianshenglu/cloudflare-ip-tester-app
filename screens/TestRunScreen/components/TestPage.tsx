import { StyleSheet, TextInput } from "react-native";
import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import { responseTestService } from "@/services/ResponseTest.service";
import { downloadTestService } from "@/services/DownloadTest.service";
import { TableHeader } from "@/components/Table/TableHeader";
import { useTableHeader } from "@/hooks/useTableHeader";
import { useTableData } from "../hooks/useTableData";
import { useTestIpCount } from "../hooks/useTestIpCount";
import { TableRows } from "@/components/Table/TableRows";
import { initialTestPageTableHeaderCols, MyTableHeaderColumn } from "../model";
import { useTestRunningStatus } from "../hooks/useTestRunningStatus";
import { miniStyle } from "@/theme";
import { Button } from "react-native-paper";
import { I18n } from "@/localize";
export default function TestPage({ path }: { path: string }) {
  const { testIpCount, setTestIpCount, getIpList } = useTestIpCount();
  const [testIpCoCurrentCount, setTestIpCoCurrentCount] = useState<string>("5");
  const [testUrl, setTestUrl] = useState<string>(
    // "http://cachefly.cachefly.net/200mb.test"
    // "http://v2ray.xianshenglu.xyz"
    // "http://ip.flares.cloud/img/l.webp"
    `https://speed.cloudflare.com/__down?bytes=${10 * 1024 * 1024}`
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
  } = useTableHeader<MyTableHeaderColumn>(initialTestPageTableHeaderCols);

  const { testRunningStatus, nextTestRunningStatus } = useTestRunningStatus();

  function onReset() {
    responseTestService.stop();
    downloadTestService.stop();
    resetTableData();
    resetTableHeader();
    const newIpList = getIpList();
    initTableData(newIpList);
    nextTestRunningStatus();
  }

  useEffect(() => {
    // in the future may need to add a status check
    startResponseSpeedTest(
      getSelectedIpList(),
      Number(testIpCoCurrentCount),
      testUrl
    );
    startDownloadSpeedTest(
      getSelectedIpList(),
      Number(testIpCoCurrentCount),
      testUrl
    );
  }, [testRunningStatus]);

  function onSort(
    colId: MyTableHeaderColumn["id"],
    sortType: MyTableHeaderColumn["sort"]
  ) {
    changeTableHeadersSortType(colId, sortType);
    sortTableData(colId, sortType);
  }
  function onTestIpCountChange(v: string) {
    setTestIpCount(() => {
      return v;
    });
  }

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
          mode="contained"
          contentStyle={{ ...styles.paperBtnContent }}
          labelStyle={{ ...miniStyle.textStyle }}
        >
          {I18n.t("testRun.testRespond")}
        </Button>
        <View style={{ marginRight: 5 }}></View>
        <Button
          onPress={() =>
            startDownloadSpeedTest(
              getSelectedIpList(),
              Number(testIpCoCurrentCount),
              testUrl
            )
          }
          mode="contained"
          contentStyle={{ ...styles.paperBtnContent }}
          labelStyle={{ ...miniStyle.textStyle }}
        >
          {I18n.t("testRun.testDownload")}
        </Button>
        <View style={{ marginRight: 5 }}></View>

        <Button
          onPress={onReset}
          mode="contained"
          contentStyle={{ ...styles.paperBtnContent }}
          labelStyle={{ ...miniStyle.textStyle }}
        >
          {I18n.t("general.start")}
        </Button>
      </View>
      <View style={styles.toolbar}>
        <Text> {I18n.t("testRun.ipCount")}</Text>
        <TextInput
          style={styles.input}
          onChangeText={onTestIpCountChange}
          value={testIpCount}
          keyboardType="numeric"
        />
        <Text> {I18n.t("testRun.coCurrentCount")}</Text>
        <TextInput
          style={styles.input}
          onChangeText={(val) => setTestIpCoCurrentCount(() => val)}
          value={testIpCoCurrentCount}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.toolbar}>
        <Text>{I18n.t("testRun.testUrl")}</Text>
        <TextInput
          style={{ ...styles.input, flex: 1 }}
          onChangeText={(val) => setTestUrl(() => val)}
          value={testUrl}
        />
      </View>

      <TableHeader
        onSort={onSort}
        cols={tableHeaders}
        style={{ cellTextStyle: miniStyle.textStyle }}
      />

      <TableRows
        rows={tableData}
        columns={tableHeaders}
        rowKeyName={"ip"}
        style={{ cellTextStyle: miniStyle.textStyle }}
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
  paperBtnContent: { marginHorizontal: -10, marginVertical: -2 },
});
