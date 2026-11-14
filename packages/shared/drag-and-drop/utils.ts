import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import {
  Destination,
  Draggable,
  draggableTypeKey,
  SortableItem,
} from './types';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

export const isDraggable = (item: any): item is Draggable =>
  draggableTypeKey in item;

export function getPosition(index: number, listLength: number) {
  if (index === 0) {
    return 'start';
  }
  if (index === listLength - 1) {
    return 'end';
  }

  return 'middle';
}

export function sortByPosition<T extends SortableItem>(list: T[]) {
  return list.toSorted(
    (a, b) => a.position - b.position || a.id.localeCompare(b.id),
  );
}

export function renumberPositions<T extends SortableItem>(list: T[]) {
  return list.map((item, index) => ({ ...item, position: index }));
}

export function getNextPosition(list: SortableItem[]) {
  const positions = list.map((item) => item.position).filter(Number.isFinite);

  return positions.length ? Math.max(...positions) + 1 : 0;
}

const getTarget = (
  originIndex: number,
  destination: Destination,
  listLength: number,
): {
  indexOfTarget: number;
  closestEdgeOfTarget: Edge;
} => {
  switch (destination) {
    case 'start':
      return { indexOfTarget: 0, closestEdgeOfTarget: 'top' };
    case 'previous':
      return { indexOfTarget: originIndex - 1, closestEdgeOfTarget: 'top' };
    case 'next':
      return {
        indexOfTarget: originIndex + 1,
        closestEdgeOfTarget: 'bottom',
      };
    case 'end':
      return {
        indexOfTarget: listLength - 1,
        closestEdgeOfTarget: 'bottom',
      };
  }
};

export const onChangePosition = (
  list: SortableItem[],
  originIndex: number,
  destination: Destination,
  onReorder: (list: SortableItem[]) => void,
) => {
  const sortedList = sortByPosition(list);
  onReorder(
    renumberPositions(
      reorderWithEdge({
        list: sortedList,
        startIndex: originIndex,
        ...getTarget(originIndex, destination, list.length),
        axis: 'vertical',
      }),
    ),
  );
};
