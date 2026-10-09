import { getNextPosition } from '../../shared/drag-and-drop/utils';
import { MediaDetails } from './types';

function listSeriesPositions<T extends MediaDetails>(items: Record<string, T>) {
  return Object.values(items).map((item, index) => ({
    item,
    id: item.id,
    position: item.position ?? index,
  }));
}

export function sortSeriesItems<T extends MediaDetails>(
  items: Record<string, T> = {},
) {
  return listSeriesPositions(items)
    .toSorted((a, b) => a.position - b.position || a.id.localeCompare(b.id))
    .map(({ item }) => item);
}

export function getNextSeriesPosition(
  items: Record<string, MediaDetails> = {},
) {
  return getNextPosition(listSeriesPositions(items));
}

export function mergeReorderedSeriesItems<T extends MediaDetails>(
  items: Record<string, T> | undefined,
  reorderedItems: { id: string }[],
) {
  const reorderedIds = new Set(reorderedItems.map(({ id }) => id));
  const remainingReorderedItems = [...reorderedItems];

  return sortSeriesItems(items).map(({ id }) =>
    reorderedIds.has(id) ? remainingReorderedItems.shift()! : { id },
  );
}
