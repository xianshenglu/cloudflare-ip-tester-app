import { getRandomItems } from "./../utils/index";
import { CfIpResponse } from "../components/TestPage";
import axios from "axios";
import { from, mergeMap } from "rxjs";
import { CfIpListV4 } from "../constants/CfIpListV4";

const getCfResponseTestFile = (ip: string) => {
  return axios.request({
    url: `http://${ip}`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
      Host: "v2ray.xianshenglu.xyz",
    },
    params: {
      v: Math.random(),
    },
    timeout: 5 * 1000,
  });
};

const getCfDownloadTestFile = (ip: string) => {
  return axios.request<File>({
    url: `http://${ip}/media/to-do-mvc.b2da547c.mp4`,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36",
      Host: "v2ray.xianshenglu.xyz",
    },
    params: {
      v: Math.random(),
    },
    timeout: 30 * 1000,
  });
};

const getCfNodeResponseTestTime = async (ip: string) => {
  const startTime = Date.now();
  const result: CfIpResponse = {
    ip,
    meanRespond: 0,
    hasError: false,
    responseTestStatus: "PENDING",
  };
  try {
    const response = await getCfResponseTestFile(ip);
    console.log(response.status, "response success");

    result.responseTestStatus = "SUCCESS";
    result.meanRespond = Date.now() - startTime;
  } catch (error) {
    result.hasError = true;
    result.responseTestStatus = "ERROR";
  }
  return result;
};
const getCfNodeDownloadTestTime = async (ip: string) => {
  const startTime = Date.now();
  const result: CfIpResponse = {
    ip,
    meanDownloadSpeed: 0,
    hasError: false,
    speedTestStatus: "PENDING",
  };
  try {
    await getCfResponseTestFile(ip);
    console.log("start download", ip);
    const { data: file } = await getCfDownloadTestFile(ip);
    console.log(file, "data file");
    result.speedTestStatus = "SUCCESS";
    const time = (Date.now() - startTime) / 1000;
    result.meanDownloadSpeed = Math.round(file.size / time);
  } catch (error) {
    console.log("download fail", error);

    result.hasError = true;
    result.speedTestStatus = "ERROR";
  }
  return result;
};
export const getCfNodesResponseTestTime = (
  totalCount: number,
  coCurrentNum: number
) => {
  const ipList = getRandomItems(CfIpListV4, totalCount);
  return from(ipList).pipe(
    mergeMap((ip) => {
      return getCfNodeResponseTestTime(ip);
    }, coCurrentNum)
  );
};
export const getCfNodesDownloadTestTime = (
  totalCount: number,
  coCurrentNum: number
) => {
  const ipList = getRandomItems(CfIpListV4, totalCount);
  return from(ipList).pipe(
    mergeMap((ip) => {
      return getCfNodeDownloadTestTime(ip);
    }, coCurrentNum)
  );
};
