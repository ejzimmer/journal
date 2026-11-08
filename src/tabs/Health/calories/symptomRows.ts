const ROWS_BY_COUNT: number[][] = [
  [],
  [1],
  [2],
  [2, 1],
  [3, 1],
  [3, 2],
  [3, 3],
  [2, 3, 2],
  [3, 3, 2],
  [2, 3, 3, 1],
];

export function splitIntoRows<T>(items: T[]): T[][] {
  const lengths =
    ROWS_BY_COUNT[items.length] ??
    Array.from({ length: Math.ceil(items.length / 3) }, () => 3);

  let start = 0;
  return lengths.map((length) => {
    const row = items.slice(start, start + length);
    start += length;
    return row;
  });
}
