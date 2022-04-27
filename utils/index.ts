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
