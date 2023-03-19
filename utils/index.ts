import { Netmask } from "netmask";
export const getRandomItems = <T extends unknown[]>(
  list: T,
  count: number
): T => {
  const result = [];
  for (var index = 0; index < count; index++) {
    var randomItem = Math.floor(Math.random() * list.length);
    result.push(list.splice(randomItem, 1)[0]);
  }
  return result as T;
};

export const getCfIpV4List = (CfIpV4Text: string) => {
  const resultList = CfIpV4Text.split("\n")
    .map((v) => v.trim())
    .filter((v) => v)
    .map((ipBlockStr) => {
      const ipBlock = new Netmask(ipBlockStr);
      const result: string[] = [];
      ipBlock.forEach((ip) => result.push(ip));
      return result;
    })
    .flat();
  return resultList;
};
