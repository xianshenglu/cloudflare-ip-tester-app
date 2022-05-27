import { STORAGE_KEY_USER_SETTINGS } from "@/screens/TestStatisticsScreen/components/StatisticsData";
import { PREFERENCES_FILEPATH, readFile, writeFile } from "@/storage";
import { debounce } from "lodash-es";
import {
  action,
  autorun,
  IReactionDisposer,
  makeObservable,
  observable,
  reaction,
} from "mobx";
import { getStoredJson, storeJson } from "./storage";
export type UserSetting = {
  isSaveDataToDevice: boolean;
};
class UserSettings {
  private defaultUserSetting: UserSetting = {
    isSaveDataToDevice: false,
  } as const;
  userSetting: UserSetting = { ...this.defaultUserSetting };
  private unsubscribeSaveToLocalStorage: IReactionDisposer | undefined;
  private unsubscribeSaveToDevice: IReactionDisposer | undefined;
  private filePath = PREFERENCES_FILEPATH;
  constructor() {
    makeObservable(this, {
      userSetting: observable,
      changeUserSettings: action,
    });

    this.mergedDeviceDataWithStorage(true)
      .catch((err) => {
        console.log(err, "merge user settings failed");
      })
      .then(() => {
        reaction(
          () => this.userSetting.isSaveDataToDevice,
          this.onSavingDataToDeviceChange.bind(this)
        ),
          { fireImmediate: true };
      });
  }
  private async onSavingDataToDeviceChange(isSaveDataToDevice: boolean) {
    if (isSaveDataToDevice) {
      await this.autoSaveToDevice();
      this.unsubscribeSaveToLocalStorage?.();
      this.resetStorageData();
      return;
    }
    this.autoSaveToLocalStorage();
    this.unsubscribeSaveToDevice?.();
    this.resetDeviceData();
  }
  private autoSaveToLocalStorage() {
    this.unsubscribeSaveToLocalStorage = autorun(() => {
      storeJson(STORAGE_KEY_USER_SETTINGS, this.userSetting);
    });
  }
  private async autoSaveToDevice() {
    await this.mergedDeviceDataWithStorage();
    this.unsubscribeSaveToDevice = autorun(
      debounce(
        () => {
          writeFile(this.filePath, JSON.stringify(this.userSetting));
        },
        1000,
        { leading: true, trailing: true, maxWait: 5000 }
      )
    );
  }
  private async mergedDeviceDataWithStorage(isFirst = false) {
    const deviceData = await this.getDeviceData();
    const storageData = await getStoredJson<Partial<UserSetting>>(
      STORAGE_KEY_USER_SETTINGS,
      {}
    );
    const targetSettings: Partial<UserSetting> = {
      ...this.defaultUserSetting,
      ...deviceData,
      ...storageData,
    };
    if (!isFirst) {
      delete targetSettings.isSaveDataToDevice;
    }

    this.changeUserSettings(targetSettings);
  }
  private async getDeviceData() {
    const jsonStr = await readFile(this.filePath);
    if (!jsonStr) {
      return {};
    }
    let result = {};
    try {
      result = JSON.parse(jsonStr);
    } catch (error) {
      return {};
    }
    return result;
  }
  private resetStorageData() {
    storeJson(STORAGE_KEY_USER_SETTINGS, {});
  }
  private resetDeviceData() {
    writeFile(this.filePath, "");
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
