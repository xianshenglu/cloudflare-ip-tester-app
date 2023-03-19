import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { Button, Switch } from "react-native-paper";
import { createAppFolderIfNeeded, initDefaultFilesIfNeeded } from "@/storage/fileAccess";
import { userSettingsStore, UserSetting } from "@/store/UserSettings";
import { observer } from "mobx-react";
import { testStatisticsStore } from "@/store/TestStatistics";
import { AppI18n } from "@/localize";
import { useTheme } from "@react-navigation/native";
import { CfIpv4CustomizeDialog } from "./CfIpv4CustomizeDialog";
import { SettingButton } from "./SettingButton";

export const ConfigList = observer(() => (
  <InternalConfigList userSettings={{ ...userSettingsStore.userSetting }} />
));

function InternalConfigList({ userSettings }: { userSettings: UserSetting }) {
  const { isSaveDataToDevice } = userSettings;

  const onToggleSwitch = async (value: boolean) => {
    try {
      await createAppFolderIfNeeded();
      await initDefaultFilesIfNeeded();
      userSettingsStore.changeUserSettings({ isSaveDataToDevice: value });
    } catch (error: any) {
      alert(error.message);
    }
  };

  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <View style={styles.item}>
          <Text>{AppI18n.t("testConfig.saveAllDataToDevice")}</Text>
          <Switch
            value={isSaveDataToDevice}
            onValueChange={onToggleSwitch}
            color={colors.primary}
          ></Switch>
        </View>
        <SettingButton
          onPress={() => testStatisticsStore.clear()}
          label={AppI18n.t("testConfig.clearHistoryStatistics")}
        ></SettingButton>
        <CfIpv4CustomizeDialog></CfIpv4CustomizeDialog>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  list: {
    flex: 1,
    flexDirection: "column",
  },
  item: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
