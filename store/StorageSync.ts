export interface StorageSync {
  mergedDeviceDataWithStorage(): unknown;
  changeStoragePlace(isSaveDataToDevice: boolean): unknown;
  autoSaveToLocalStorage(): unknown;
  autoSaveToDevice(): unknown;
  getDeviceData(): unknown;
  resetDeviceData(): unknown;
  resetStorageData(): unknown;
  clear?(): unknown;
}
