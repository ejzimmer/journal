import { LoggedSymptom } from './symptoms';
import { splitIntoRows } from './symptomRows';

export const HOVER_ICON_SIZE = 24;
const GAP = 2;
const TEXT_WIDTH = 70;
const TEXT_HEIGHT = 36;
const MIN_SIZE = 106;
const PADDING = 14;

export function getHoverSize(symptoms: LoggedSymptom[]) {
  const rows = splitIntoRows(symptoms);
  if (!rows.length) return MIN_SIZE;

  const longestRow = Math.max(...rows.map((row) => row.length));
  const iconsWidth = longestRow * HOVER_ICON_SIZE + (longestRow - 1) * GAP;
  const iconsHeight = rows.length * HOVER_ICON_SIZE + (rows.length - 1) * GAP;
  const width = Math.max(TEXT_WIDTH, iconsWidth);
  const height = TEXT_HEIGHT + GAP * 2 + iconsHeight;

  return Math.max(MIN_SIZE, Math.ceil(Math.hypot(width, height)) + PADDING);
}
