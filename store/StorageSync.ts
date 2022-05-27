/**
 * @todo how to refactor with this logic?
 */
export abstract class StorageSync {
  autoSaveToLocalStorage() {}
  autoSaveToDevice() {}
  mergedDeviceDataWithStorage() {}
  getDeviceData() {}
  resetDeviceData() {}
}
export interface IStorageSync {
  autoSaveToLocalStorage: () => void;
  autoSaveToDevice: () => void;
  mergedDeviceDataWithStorage: () => void;
  getDeviceData: () => void;
  resetDeviceData: () => void;
}
