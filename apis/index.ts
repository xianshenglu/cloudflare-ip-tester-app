import { getInitialCfIpResponse } from "./../screens/TestRunScreen/utils/index";
import { RequestStatus } from "@/typings/index";
import { getCfIpV4List, getRandomItems } from "@/utils/index";
import axios from "axios";
import { bufferCount, concatMap, from, map, mergeMap } from "rxjs";
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
const getCfResponseTestFile = (ip: string, testUrl: string) => {
  const { host, oldUrl, newUrl } = getTargetUrlConfig(ip, testUrl);
  newUrl.set("pathname", "");
  newUrl.set("query", "");
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
  const result: CfIpResponse = getInitialCfIpResponse(ip, {
    respondTestStatus: RequestStatus.Pending,
  });
  try {
    const response = await getCfResponseTestFile(ip, testUrl);

    result.respondTestStatus = "SUCCESS";
    result.respondTime = Date.now() - startTime;
  } catch (error) {
    console.log(error, "response error");

    result.respondTestStatus = "ERROR";
  }
  return result;
};
const getCfNodeDownloadTestTime = async (ip: string, testUrl: string) => {
  const startTime = Date.now();
  const result: CfIpResponse = getInitialCfIpResponse(ip, {
    downloadSpeedTestStatus: RequestStatus.Pending,
  });
  try {
    await getCfResponseTestFile(ip, testUrl);
    const response = await getCfDownloadTestFile(ip, testUrl);
    const { data: file } = response;
    result.downloadSpeedTestStatus = "SUCCESS";
    const time = (Date.now() - startTime) / 1000;
    const fileSize = file.size / (1024 * 1024); //MB
    result.downloadSpeed = round(fileSize / time, 2);
  } catch (error) {
    console.log("download fail", error);
    result.downloadSpeedTestStatus = "ERROR";
  }
  return result;
};
export const getCfNodesResponseTestTime = (
  ipList: string[],
  coCurrentNum: number,
  testUrl: string
) => {
  let totalCount = 4;
  return from(ipList).pipe(
    mergeMap((ip) => {
      return from(Array(totalCount).fill(ip)).pipe(
        concatMap(() => getCfNodeResponseTestTime(ip, testUrl)),
        bufferCount(totalCount),
        map((responseList) => {
          let successCount = 0;
          let successRespondTime = 0;
          responseList.forEach((response) => {
            const isSuccess =
              response.respondTestStatus === RequestStatus.Success;
            if (!isSuccess) {
              return;
            }
            successCount++;
            successRespondTime += response.respondTime!;
          });
          return getInitialCfIpResponse(ip, {
            respondTime: round(successRespondTime / successCount, 0),
            respondTestStatus:
              successCount === 0 ? RequestStatus.Error : RequestStatus.Success,
            packetLossRate: round(
              (100 * (totalCount - successCount)) / totalCount,
              0
            ),
          });
        })
      );
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
  const ipList = getRandomItems(getCfIpV4List(), totalCount);
  return ipList;
};