import { splitIntoRows } from './symptomRows';

const CONTENT_SIZE = 30;
const GAP = 2;
const MAX_ICON_SIZE = 14;

export function getRestingIconSize(count: number) {
  const rows = splitIntoRows(Array.from({ length: count }));
  const longestRow = Math.max(...rows.map((row) => row.length));
  return Math.min(
    MAX_ICON_SIZE,
    getSizeToFit(longestRow),
    getSizeToFit(rows.length),
  );
}

function getSizeToFit(iconCount: number) {
  return (CONTENT_SIZE - (iconCount - 1) * GAP) / iconCount;
}
