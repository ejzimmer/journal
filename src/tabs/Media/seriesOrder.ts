import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { Destination } from '../../shared/drag-and-drop/types';
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

function getDestinationIndex(
  index: number,
  destination: Destination,
  length: number,
) {
  switch (destination) {
    case 'start':
      return 0;
    case 'previous':
      return Math.max(0, index - 1);
    case 'next':
      return Math.min(length - 1, index + 1);
    case 'end':
      return length - 1;
  }
}

export function moveSeriesItem<T>(
  items: T[],
  index: number,
  destination: Destination,
) {
  return reorder({
    list: items,
    startIndex: index,
    finishIndex: getDestinationIndex(index, destination, items.length),
  });
}

export function dropSeriesItem<T extends { id: string }>({
  items,
  itemId,
  targetId,
  edge,
}: {
  items: T[];
  itemId: string;
  targetId: string;
  edge: Edge | null;
}) {
  return reorderWithEdge({
    list: items,
    startIndex: items.findIndex((item) => item.id === itemId),
    indexOfTarget: items.findIndex((item) => item.id === targetId),
    closestEdgeOfTarget: edge,
    axis: 'horizontal',
  });
}
