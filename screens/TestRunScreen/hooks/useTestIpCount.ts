import { getRandomCfIpList } from "@/apis/index";
import { useState } from "react";
export function useTestIpCount() {
  const [testIpCount, setTestIpCount] = useState<string>("20");

  const getIpList = () => getRandomCfIpList(Number(testIpCount));
  return { testIpCount, setTestIpCount, getIpList };
}
