import { CfIpV4Text } from "@/constants/CfIpListV4";
import { action, makeObservable, observable, reaction } from "mobx";
import { UserSettingsStorageSync } from "./UserSettingsStorageSync";
export type UserSetting = {
  isSaveDataToDevice: boolean;
  defaultCfIpv4Text: string;
  customizedCfIpv4Text: string;
};
class UserSettings {
  private defaultUserSetting: UserSetting = {
    isSaveDataToDevice: false,
    defaultCfIpv4Text: CfIpV4Text,
    customizedCfIpv4Text: CfIpV4Text,
  } as const;
  readonly userSetting: UserSetting = { ...this.defaultUserSetting };
  private storageSync: UserSettingsStorageSync;
  constructor() {
    makeObservable(this, {
      userSetting: observable,
      changeUserSettings: action,
      changeCfIpv4ListText: action,
      resetCfIpv4ListText: action,
    });
    this.storageSync = new UserSettingsStorageSync(
      this.userSetting,
      this.defaultUserSetting
    );
    this.storageSync
      .mergedDeviceDataWithStorage(true)
      .then((userSetting) => {
        this.changeUserSettings(userSetting);

        reaction(
          () => this.userSetting.isSaveDataToDevice,
          async (isSaveDataToDevice) => {
            const result = await this.storageSync.changeStoragePlace(
              isSaveDataToDevice
            );
            this.changeUserSettings(result);
          },
          { fireImmediately: true }
        )          
      })
      .catch((err) => {
        console.log(err, "merge user settings failed");
      });
  }
  public changeUserSettings(userSetting: Partial<UserSetting>) {
    (Object.keys(userSetting) as (keyof Partial<UserSetting>)[]).forEach(
      (key) => {
        this.userSetting[key] = userSetting[key]!;
      }
    );
  }
  public changeCfIpv4ListText(customizedCfIpv4Text: string) {
    this.userSetting.customizedCfIpv4Text = customizedCfIpv4Text;
  }
  public resetCfIpv4ListText() {
    this.userSetting.customizedCfIpv4Text = this.userSetting.defaultCfIpv4Text;
  }
  public getCurIpv4ListText() {
    return this.userSetting.customizedCfIpv4Text;
  }
  public getDefaultIpv4ListText() {
    return this.userSetting.defaultCfIpv4Text
  }
}

const userSettingsStore = new UserSettings();

export { userSettingsStore };
