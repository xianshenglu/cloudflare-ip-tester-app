import { RequestStatus } from "@/typings";
import { CfIpResponse } from "../model";

export const getInitialCfIpResponse = (
  ip: string,
  options: Partial<CfIpResponse> = {}
): CfIpResponse => {
  return {
    ip,
    downloadSpeed: 0,
    downloadSpeedTestStatus: RequestStatus.Uninitialized,
    respondTime: 0,
    respondTestStatus: RequestStatus.Uninitialized,
    packetLossRate: 0,
    ...options,
  };
};
