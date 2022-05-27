import { STORAGE_KEY_USER_SETTINGS } from "@/screens/TestStatisticsScreen/components/StatisticsData";
import {
  PREFERENCES_FILEPATH,
  readFile,
  writeFile,
} from "@/storage/fileAccess";
import { debounce } from "lodash-es";
import { autorun, IReactionDisposer } from "mobx";
import { getStoredJson, storeJson } from "@/storage/localStorage";
import { StorageSync } from "./StorageSync";
export type UserSetting = {
  isSaveDataToDevice: boolean;
};
export class UserSettingsStorageSync implements StorageSync {
  private userSetting: UserSetting;
  private defaultUserSetting: UserSetting;
  private unsubscribeSaveToLocalStorage: IReactionDisposer | undefined;
  private unsubscribeSaveToDevice: IReactionDisposer | undefined;
  private filePath = PREFERENCES_FILEPATH;

  constructor(userSetting: UserSetting, defaultUserSetting: UserSetting) {
    this.userSetting = userSetting;
    this.defaultUserSetting = defaultUserSetting;
  }
  public async changeStoragePlace(isSaveDataToDevice: boolean) {
    if (isSaveDataToDevice) {
      const result = await this.autoSaveToDevice();
      this.unsubscribeSaveToLocalStorage?.();
      this.resetStorageData();
      return result;
    }
    const result = await this.autoSaveToLocalStorage();
    this.unsubscribeSaveToDevice?.();
    this.resetDeviceData();
    return result;
  }
  public async autoSaveToLocalStorage() {
    const result = await this.mergedDeviceDataWithStorage();

    this.unsubscribeSaveToLocalStorage = autorun(() => {
      storeJson(STORAGE_KEY_USER_SETTINGS, this.userSetting);
    });
    return result;
  }
  public async autoSaveToDevice() {
    const result = await this.mergedDeviceDataWithStorage();
    this.unsubscribeSaveToDevice = autorun(
      debounce(
        () => {
          writeFile(this.filePath, JSON.stringify(this.userSetting));
        },
        1000,
        { leading: true, trailing: true, maxWait: 5000 }
      )
    );
    return result;
  }
  public async mergedDeviceDataWithStorage(isFirst = false) {
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

    return targetSettings;
  }
  public async getDeviceData() {
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
  public resetStorageData() {
    storeJson(STORAGE_KEY_USER_SETTINGS, {});
  }
  public resetDeviceData() {
    writeFile(this.filePath, "");
  }
}
