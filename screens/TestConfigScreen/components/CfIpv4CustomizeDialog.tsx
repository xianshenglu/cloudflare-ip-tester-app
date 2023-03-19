import { TextInput } from "@/components/Themed";
import { AppI18n } from "@/localize";
import { userSettingsStore } from "@/store/UserSettings";
import * as React from "react";
import { Button, Dialog, Portal } from "react-native-paper";
import { SettingButton } from "./SettingButton";

export function CfIpv4CustomizeDialog() {
  const [visible, setVisible] = React.useState(false);
  const [tempIpv4List, setTempIpv4List] = React.useState(
    userSettingsStore.getCurIpv4ListText()
  );

  const showModal = () => setVisible(true);
  const onDismiss = () => {
    setVisible(false);
    clearTempData();
  };
  const clearTempData = () =>
    setTempIpv4List(() => userSettingsStore.getCurIpv4ListText());

  const onReset = () => {
    setTempIpv4List(() => userSettingsStore.getDefaultIpv4ListText());
  };
  const onConfirmChangeIpList = () => {
    userSettingsStore.changeCfIpv4ListText(tempIpv4List);
    onDismiss();
  };
  const onChangeIpList = (v: string) => {
    setTempIpv4List(() => v);
  };
  const title = AppI18n.t("testConfig.customizeCfIpv4List");
  return (
    <React.Fragment>
      <SettingButton onPress={showModal} label={title}></SettingButton>
      <Portal>
        <Dialog visible={visible} onDismiss={onDismiss} dismissable={false}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              onChangeText={onChangeIpList}
              value={tempIpv4List}
              multiline={true}
              style={{ borderWidth: 1, paddingHorizontal: 8 }}
            ></TextInput>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={onReset} mode="contained">
              {AppI18n.t("general.reset")}
            </Button>
            <Button
              onPress={onDismiss}
              mode="contained"
              style={{ marginHorizontal: 16 }}
            >
              {AppI18n.t("general.cancel")}
            </Button>
            <Button onPress={onConfirmChangeIpList} mode="contained">
              {AppI18n.t("general.confirm")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </React.Fragment>
  );
}
