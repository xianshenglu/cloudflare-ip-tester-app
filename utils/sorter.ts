import { SortType } from "@/typings";
interface Sorter<T = any, Value = unknown> {
  (
    list: T[],
    sortType: `${SortType}`,
    getValue?: (arg: T) => Value,
    isInvalidValue?: (arg: T) => boolean
  ): T[];
}

export const sortByNumber: Sorter<any, number> = (
  list,
  sortType,
  getValue = (item) => item,
  isInvalidValue = (item) => false
) => {
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
};

export const sortByIp: Sorter<any, string> = (
  list,
  sortType,
  getValue = (item) => item,
  isInvalidValue = (item) => false
) => {
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
};

export const sortByString: Sorter<any, string> = (
  list,
  sortType,
  getValue = (item) => item,
  isInvalidValue = (item) => false
) => {
  const invalidValues = list.filter((item) => isInvalidValue(item));
  const validValues = list.filter((item) => !isInvalidValue(item));
  const validResult = validValues.sort((itemA, itemB) => {
    return getValue(itemA) < getValue(itemB) ? -1 : 1;
  });
  if (sortType === SortType.Descending) {
    validResult.reverse();
  }
  const result = validResult.concat(invalidValues);
  return result;
};
