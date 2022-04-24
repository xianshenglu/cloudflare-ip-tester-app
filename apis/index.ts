import { getRandomItems } from "./../utils/index";
import { CfIpResponse } from "../components/TestPage";
import axios from "axios";
import { from, mergeMap } from "rxjs";
import { CfIpListV4 } from "../constants/CfIpListV4";
import urlParse from "url-parse";
import { round } from "lodash-es";
const getTargetUrlConfig = (ip: string, testUrl: string) => {
  const oldUrl = urlParse(testUrl, true);
  const newUrl = urlParse(testUrl, true);
  // @ts-ignore
  newUrl.host = ip;
  return {
    url: newUrl.toString(),
    newUrl,
    host: oldUrl.host,
    oldUrl,
  };
};
const getCfResponseTestFile = (ip: string, testUrl: string) => {
  const { url, host, oldUrl } = getTargetUrlConfig(ip, testUrl);
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
    Host: host,
    Referer: oldUrl.toString(),
    Origin: oldUrl.origin,
  };
  console.log(url, headers);

  return axios.request({
    url,
    headers,
    params: {
      v: Math.random(),
    },
    timeout: 5 * 1000,
  });
};

const getCfDownloadTestFile = (ip: string, testUrl: string) => {
  const { url, host, oldUrl } = getTargetUrlConfig(ip, testUrl);
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
    Host: host,
    Referer: oldUrl.toString(),
    Origin: oldUrl.origin,
  };
  return axios.request<File>({
    url,
    headers,
    params: {
      v: Math.random(),
    },
    timeout: 30 * 1000,
    responseType: "blob",
  });
};

const getCfNodeResponseTestTime = async (ip: string, testUrl: string) => {
  const startTime = Date.now();
  const result: CfIpResponse = {
    ip,
    meanRespond: 0,
    hasError: false,
    responseTestStatus: "PENDING",
  };
  try {
    const response = await getCfResponseTestFile(ip, testUrl);

    result.responseTestStatus = "SUCCESS";
    result.meanRespond = Date.now() - startTime;
  } catch (error) {
    console.log(error, "response error");

    result.hasError = true;
    result.responseTestStatus = "ERROR";
  }
  return result;
};
const getCfNodeDownloadTestTime = async (ip: string, testUrl: string) => {
  const startTime = Date.now();
  const result: CfIpResponse = {
    ip,
    meanDownloadSpeed: 0,
    hasError: false,
    speedTestStatus: "PENDING",
  };
  try {
    await getCfResponseTestFile(ip, testUrl);
    const response = await getCfDownloadTestFile(ip, testUrl);
    const { data: file } = response;
    result.speedTestStatus = "SUCCESS";
    const time = (Date.now() - startTime) / 1000;
    const fileSize = file.size / (1024 * 1024); //MB
    result.meanDownloadSpeed = round(fileSize / time, 2);
  } catch (error) {
    console.log("download fail", error);
    result.hasError = true;
    result.speedTestStatus = "ERROR";
  }
  return result;
};
export const getCfNodesResponseTestTime = (
  totalCount: number,
  coCurrentNum: number,
  testUrl: string
) => {
  const ipList = getRandomItems(CfIpListV4, totalCount);
  return from(ipList).pipe(
    mergeMap((ip) => {
      return getCfNodeResponseTestTime(ip, testUrl);
    }, coCurrentNum)
  );
};
export const getCfNodesDownloadTestTime = (
  totalCount: number,
  coCurrentNum: number,
  testUrl: string
) => {
  const ipList = getRandomItems(CfIpListV4, totalCount);
  return from(ipList).pipe(
    mergeMap((ip) => {
      return getCfNodeDownloadTestTime(ip, testUrl);
    }, coCurrentNum)
  );
};
