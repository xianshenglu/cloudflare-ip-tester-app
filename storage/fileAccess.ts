import { AppI18n } from "@/localize";
import { Dirs, FileSystem } from "react-native-file-access";
import {
  checkMultiple,
  PERMISSIONS,
  Permission,
  RESULTS,
  requestMultiple,
} from "react-native-permissions";
import packageJson from "../package.json";
export const APP_DIR = Dirs.SDCardDir! + `/${packageJson.name}`;

export const PREFERENCES_FILEPATH = `${APP_DIR}/preferences.json` as const;
export const STATISTICS_FILEPATH = `${APP_DIR}/statistics.json` as const;

const formatPermRequestResult = (
  resultMap: Record<Permission, PermissionStatus>
) => {
  const permKeys = Object.keys(resultMap) as Permission[];

  const failedMap = permKeys.reduce((acc, permKey: Permission) => {
    const isGranted = (resultMap[permKey] as any) === RESULTS.GRANTED;
    if (isGranted) {
      return acc;
    }
    const value = resultMap[permKey];
    // @ts-ignore
    acc[permKey] = value;
    return acc;
  }, {} as Record<Permission, PermissionStatus>);

  const hasAllPerms = Object.keys(failedMap).length === 0;

  return {
    failedMap,
    hasAllPerms,
  };
};
const requestMultiplePermsIfNeeded = async (permKeys: Permission[]) => {
  const resultMap = await checkMultiple(permKeys);
  const { hasAllPerms, failedMap } = formatPermRequestResult(resultMap as any);

  if (hasAllPerms) {
    return { hasAllPerms: true, reasons: null };
  }
  const failedPermKeys = Object.keys(failedMap) as Permission[];

  const newResultMap = await requestMultiple(failedPermKeys);

  const { hasAllPerms: newHasAllPerms, failedMap: newFailedMap } =
    formatPermRequestResult(newResultMap as any);
  if (newHasAllPerms) {
    return { hasAllPerms: true, reasons: null };
  }
  return { hasAllPerms: false, reasons: newFailedMap };
};
export async function createAppFolderIfNeeded() {
  const { hasAllPerms } = await requestMultiplePermsIfNeeded([
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ]);
  if (!hasAllPerms) {
    throw new Error(AppI18n.t("general.getPermFailed"));
  }
  try {
    await FileSystem.mkdir(APP_DIR);
  } catch (error: any) {
    if ((error.code = "EEXIST")) {
      return;
    }
    throw new Error(error.message);
  }
}
export const initDefaultFilesIfNeeded = async () => {
  const isPreferenceExist = await FileSystem.exists(PREFERENCES_FILEPATH);
  const isStatisticsExist = await FileSystem.exists(STATISTICS_FILEPATH);

  if (!isPreferenceExist) {
    await FileSystem.writeFile(PREFERENCES_FILEPATH, "{}", "utf8");
  }
  if (!isStatisticsExist) {
    await FileSystem.writeFile(STATISTICS_FILEPATH, "{}", "utf8");
  }
};

export const writeFile = async (path: string, str: string) => {
  const isFileExist = await FileSystem.exists(path);

  if (!isFileExist) {
    return;
  }
  const resultMap = await checkMultiple([
    PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
  ]);
  const { hasAllPerms } = formatPermRequestResult(resultMap as any);
  if (!hasAllPerms) {
    return;
  }

  await FileSystem.writeFile(path, str, "utf8");
};

export const readFile = async (path: string) => {
  const isFileExist = await FileSystem.exists(path);

  if (!isFileExist) {
    return null;
  }
  const resultMap = await checkMultiple([
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  ]);
  const { hasAllPerms } = formatPermRequestResult(resultMap as any);
  if (!hasAllPerms) {
    return;
  }
  const jsonStr = await FileSystem.readFile(path, "utf8");
  return jsonStr;
};
