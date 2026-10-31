import { splitIntoRows } from './symptomRows';

const CONTENT_SIZE = 30;
const GAP = 2;
const MAX_ICON_SIZE = 14;

export function getRestingIconSize(count: number) {
  const rows = splitIntoRows(Array.from({ length: count }));
  const longestRow = Math.max(...rows.map((row) => row.length));
  const fit = (n: number) => (CONTENT_SIZE - (n - 1) * GAP) / n;
  return Math.min(MAX_ICON_SIZE, fit(longestRow), fit(rows.length));
}
