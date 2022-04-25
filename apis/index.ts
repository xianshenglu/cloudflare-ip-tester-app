import { getRandomItems } from "@/utils/index";
import axios from "axios";
import { from, mergeMap } from "rxjs";
import { CfIpListV4 } from "@/constants/CfIpListV4";
import urlParse from "url-parse";
import { round } from "lodash-es";
import { CfIpResponse } from "@/screens/TestRunScreen/model";
const getTargetUrlConfig = (ip: string, testUrl: string) => {
  const oldUrl = urlParse(testUrl, true);
  const newUrl = urlParse(testUrl, true);
  newUrl.set("host", ip);
  return {
    newUrl,
    host: oldUrl.host,
    oldUrl,
  };
};
const getCfResponseTestFile = (ip: string) => {
  const testUrl = `https://speed.cloudflare.com/__down`;
  const { host, oldUrl, newUrl } = getTargetUrlConfig(ip, testUrl);
  newUrl.set("host", ip);
  newUrl.set("protocol", "http:");
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
    Host: host,
    Referer: oldUrl.toString(),
    Origin: oldUrl.origin,
  };
  // console.log(host, newUrl.toString());

  return axios.request({
    url: newUrl.toString(),
    headers,
    params: {
      v: Math.random(),
      bytes: 0,
    },
    timeout: 5 * 1000,
  });
};

const getCfDownloadTestFile = (ip: string, testUrl: string) => {
  const { host, oldUrl, newUrl } = getTargetUrlConfig(ip, testUrl);
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
    Host: host,
    Referer: oldUrl.toString(),
    Origin: oldUrl.origin,
  };
  newUrl.set("protocol", "http:");
  return axios.request<File>({
    url: newUrl.toString(),
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
    responseTestStatus: "PENDING",
  };
  try {
    const response = await getCfResponseTestFile(ip);

    result.responseTestStatus = "SUCCESS";
    result.meanRespond = Date.now() - startTime;
  } catch (error) {
    console.log(error, "response error");

    result.responseTestStatus = "ERROR";
  }
  return result;
};
const getCfNodeDownloadTestTime = async (ip: string, testUrl: string) => {
  const startTime = Date.now();
  const result: CfIpResponse = {
    ip,
    meanDownloadSpeed: 0,
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
    result.speedTestStatus = "ERROR";
  }
  return result;
};
export const getCfNodesResponseTestTime = (
  ipList: string[],
  coCurrentNum: number,
  testUrl: string
) => {
  return from(ipList).pipe(
    mergeMap((ip) => {
      return getCfNodeResponseTestTime(ip, testUrl);
    }, coCurrentNum)
  );
};
export const getCfNodesDownloadTestTime = (
  ipList: string[],
  coCurrentNum: number,
  testUrl: string
) => {
  return from(ipList).pipe(
    mergeMap((ip) => {
      return getCfNodeDownloadTestTime(ip, testUrl);
    }, coCurrentNum)
  );
};
export const getRandomCfIpList = (totalCount: number) => {
  const ipList = getRandomItems(CfIpListV4, totalCount);
  return ipList;
};
