import { action, makeObservable, observable, reaction } from "mobx";
import { UserSettingsStorageSync } from "./UserSettingsStorageSync";
export type UserSetting = {
  isSaveDataToDevice: boolean;
};
class UserSettings {
  private defaultUserSetting: UserSetting = {
    isSaveDataToDevice: false,
  } as const;
  readonly userSetting: UserSetting = { ...this.defaultUserSetting };
  private storageSync: UserSettingsStorageSync;
  constructor() {
    makeObservable(this, {
      userSetting: observable,
      changeUserSettings: action,
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
          }
        ),
          { fireImmediate: true };
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
}

const userSettingsStore = new UserSettings();

export { userSettingsStore };
