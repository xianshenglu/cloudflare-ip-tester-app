import { SortType } from "../typings/index";
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

export function sortByNumber<T = unknown>(
  list: T[],
  sortType: `${SortType}`,
  getValue: (arg: T) => any,
  isInvalidValue: (arg: T) => boolean = (arg) => false
) {
  const invalidValues = list.filter((item) => isInvalidValue(item));
  const validValues = list.filter((item) => !isInvalidValue(item));
  const validResult = validValues.sort((itemA, itemB) => {
    const isAGreater = isInvalidValue(itemA);
    if (isAGreater) {
      return 1;
    }
    const isBGreater = isInvalidValue(itemB);
    if (isBGreater) {
      return -1;
    }
    return getValue(itemA) < getValue(itemB) ? -1 : 1;
  });

  if (sortType === SortType.Descending) {
    validResult.reverse();
  }
  const result = validResult.concat(invalidValues);
  return result;
}
export function sortByIp<T = unknown>(
  list: T[],
  sortType: `${SortType}`,
  getValue: (arg: T) => string,
  isInvalidValue: (arg: T) => boolean = (arg) => false
) {
  const invalidValues = list.filter((item) => isInvalidValue(item));
  const validValues = list.filter((item) => !isInvalidValue(item));
  const ipToNumber = (ip: string) =>
    Number(
      ip
        .split(".")
        .map((str) => str.padStart(3, "0"))
        .join("")
    );
  const validResult = validValues.sort((itemA, itemB) =>
    ipToNumber(getValue(itemA)) < ipToNumber(getValue(itemB)) ? -1 : 1
  );
  if (sortType === SortType.Descending) {
    validResult.reverse();
  }
  const result = validResult.concat(invalidValues);
  return result;
}
export function sortByString<T = unknown>(
  list: T[],
  sortType: `${SortType}`,
  getValue: (arg: T) => string
) {
  const result = list.slice().sort((itemA, itemB) => {
    return getValue(itemA) < getValue(itemB) ? -1 : 1;
  });
  if (sortType === SortType.Descending) {
    result.reverse();
  }
  return result;
}
