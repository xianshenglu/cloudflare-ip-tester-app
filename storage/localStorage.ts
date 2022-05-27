import AsyncStorage from "@react-native-async-storage/async-storage";
export const storeJson = async (
  storageKey: string,
  value: Record<string, any> | any[]
) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(storageKey, jsonValue);
  } catch (e) {}
};

export const getStoredJson = async <T = any>(
  storageKey: string,
  defaultValue: T
): Promise<T> => {
  const value = await AsyncStorage.getItem(storageKey);

  if (value !== "null" && value !== null) {
    return JSON.parse(value);
  }

  return defaultValue;
};
