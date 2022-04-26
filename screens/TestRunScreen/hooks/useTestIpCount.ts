import { getRandomCfIpList } from "@/apis/index";
import { useState } from "react";
export function useTestIpCount() {
  const [testIpCount, setTestIpCount] = useState<string>("2");

  const getIpList = () => getRandomCfIpList(Number(testIpCount));
  return { testIpCount, setTestIpCount, getIpList };
}
