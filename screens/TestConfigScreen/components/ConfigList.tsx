import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { Button, Switch } from "react-native-paper";
import { createAppFolderIfNeeded, initDefaultFilesIfNeeded } from "@/storage/fileAccess";
import { userSettingsStore, UserSetting } from "@/store/UserSettings";
import { observer } from "mobx-react";
import { testStatisticsStore } from "@/store/TestStatistics";
import { I18n } from "@/localize";
import { APP_THEME } from "@/theme";

export const ConfigList = observer(() => (
  <InternalConfigList userSettings={{ ...userSettingsStore.userSetting }} />
));
function SettingButton(props: { onPress: () => void; label: string }) {
  const { onPress, label } = props;
  return (
    <View style={styles.item}>
      <Button
        mode="text"
        uppercase={false}
        style={{
          width: "100%",
        }}
        labelStyle={{
          color: "#000",
          fontFamily: "inherit",
        }}
        contentStyle={{
          marginLeft: -16,
          alignSelf: "flex-start",
        }}
        onPress={onPress}
      >
        {label}
      </Button>
    </View>
  );
}
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

  return (
    <View style={styles.container}>
      <View style={styles.list}>
        <View style={styles.item}>
          <Text>{I18n.t("testConfig.saveAllDataToDevice")}</Text>
          <Switch
            value={isSaveDataToDevice}
            onValueChange={onToggleSwitch}
            color={APP_THEME.colors.primary}
          ></Switch>
        </View>
        <SettingButton
          onPress={() => testStatisticsStore.clear()}
          label={I18n.t("testConfig.clearHistoryStatistics")}
        ></SettingButton>
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
