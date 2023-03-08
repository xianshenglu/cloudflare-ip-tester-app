import * as dotenv from "dotenv";
import fs from "fs";

loadDevEnv();
createAppCenterConf();

function loadDevEnv() {
  if (!process.env.NODE_ENV) {
    dotenv.config();
  }
}
function createAppCenterConf() {
  const appCenterFolderPath = "android/app/src/main/assets";

  if (!fs.existsSync(appCenterFolderPath)) {
    fs.mkdirSync(appCenterFolderPath, { recursive: true });
  }
  fs.writeFileSync(
    appCenterFolderPath + "/appcenter-config.json",
    `{"app_secret": "${process.env.APP_CENTER_SECRET}"}`
  );
}