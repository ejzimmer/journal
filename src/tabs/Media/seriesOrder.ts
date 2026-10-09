import { getNextPosition } from '../../shared/drag-and-drop/utils';
import { MediaDetails } from './types';

function getSeriesPositions<T extends MediaDetails>(items: Record<string, T>) {
  return Object.values(items).map((item, index) => ({
    item,
    id: item.id,
    position: item.position ?? index,
  }));
}

export function sortSeriesItems<T extends MediaDetails>(
  items: Record<string, T> = {},
) {
  return getSeriesPositions(items)
    .toSorted((a, b) => a.position - b.position || a.id.localeCompare(b.id))
    .map(({ item }) => item);
}

export function getNextSeriesPosition(
  items: Record<string, MediaDetails> = {},
) {
  return getNextPosition(getSeriesPositions(items));
}
