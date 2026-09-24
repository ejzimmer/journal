import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useCallback } from 'react';
import { useStorageContext } from '../FirebaseContext';
import {
  Draggable,
  DropTarget,
  OrderedListItem,
  draggableTypeKey,
} from './types';
import { isDraggable, renumberPositions, sortByPosition } from './utils';

type UseDraggableArgs<T> = {
  listId: string;
  canDropSourceOnTarget: (source: Draggable, target: DropTarget) => boolean;
  getTargetListId: (source: Draggable, target: DropTarget) => string;
  getAxis: (source: Draggable) => 'horizontal' | 'vertical';
  moveItemBetweenLists?: (args: {
    item: T;
    movedItem: T;
    sourceListId: string;
    targetListId: string;
    targetListItems?: T[];
  }) => void;
  useValue?: <U>(key?: string) => { value?: U; loading: boolean };
  updateList?: <U extends { id: string }>(listName: string, list: U[]) => void;
};

export function useDraggableList<
  T extends Omit<OrderedListItem, typeof draggableTypeKey>,
>({
  listId,
  canDropSourceOnTarget,
  getTargetListId,
  getAxis,
  moveItemBetweenLists,
  useValue: useValueProp,
  updateList: updateListProp,
}: UseDraggableArgs<T>) {
  const storageContext = useStorageContext();
  const useValue = useValueProp ?? storageContext.useValue;
  const updateList = updateListProp ?? storageContext.updateList;

  const { value } = useValue<Record<string, T>>(listId);

  const getDestinationIndex = useCallback(
    (sortedList: T[], target?: DropTarget) => {
      if (!isDraggable(target)) {
        return 0;
      }

      const targetIndex = sortedList.findIndex((item) => item.id === target.id);
      if (targetIndex === -1) {
        return 0;
      }

      const closestEdge = extractClosestEdge(target);
      return closestEdge === 'bottom' ? targetIndex + 1 : targetIndex;
    },
    [],
  );

  const getItemByPath = useCallback(
    (path: string, value: Record<string, any>) => {
      const relativePath = path.replace(`${listId}`, '').replace(/^\//, '');
      if (!relativePath) {
        return value;
      }
      const pathSegments = relativePath.split('/');

      let target = value[pathSegments[0]];
      for (let i = 1; i < pathSegments.length; i++) {
        target = target[pathSegments[i]];
      }

      return target;
    },
    [listId],
  );

  const updatePosition = useCallback(
    ({
      listId,
      dropTargetData,
      sourceId,
      axis,
    }: {
      listId: string;
      dropTargetData: DropTarget;
      sourceId: string;
      axis: 'horizontal' | 'vertical';
    }) => {
      if (!isDraggable(dropTargetData) || !value) {
        return;
      }

      const list = getItemByPath(listId, value) as Record<string, T>;
      const sortedList = sortByPosition(Object.values(list));
      const startIndex = sortedList.findIndex((item) => item.id === sourceId);
      const indexOfTarget = sortedList.findIndex(
        (item) => item.id === dropTargetData.id,
      );
      if (startIndex === -1 || indexOfTarget === -1) {
        return;
      }

      const reorderedList = renumberPositions(
        reorderWithEdge({
          list: sortedList,
          startIndex,
          indexOfTarget,
          closestEdgeOfTarget: extractClosestEdge(dropTargetData),
          axis,
        }),
      );

      updateList(listId, reorderedList);
    },
    [updateList, value, getItemByPath],
  );

  useEffect(() => {
    if (!value) {
      return;
    }

    return monitorForElements({
      canMonitor({ source, initial: { dropTargets } }) {
        const dropTargetData = dropTargets[0]?.data as DropTarget;
        return (
          dropTargetData &&
          isDraggable(source.data) &&
          canDropSourceOnTarget(source.data, dropTargetData)
        );
      },
      onDrop({ location, source }) {
        const sourceData = source.data as Draggable;
        if (!isDraggable(sourceData) || !location.current.dropTargets.length) {
          return;
        }

        const dropTargets = location.current.dropTargets;
        const dropTargetData = dropTargets[0].data as DropTarget;
        const targetListId = getTargetListId(sourceData, dropTargetData);
        if (sourceData.parentId === targetListId) {
          updatePosition({
            listId: targetListId,
            dropTargetData,
            sourceId: sourceData.id,
            axis: getAxis(sourceData),
          });
        } else if (
          isDraggable(dropTargetData) &&
          dropTargetData[draggableTypeKey] === sourceData[draggableTypeKey]
        ) {
          const targetList = getItemByPath(targetListId, value) as Record<
            string,
            T
          >;
          const sortedTarget = renumberPositions(
            sortByPosition(Object.values(targetList)),
          );
          const targetListIndex = getDestinationIndex(
            sortedTarget,
            dropTargetData,
          );

          const item = getItemByPath(
            `${sourceData.parentId}/${sourceData.id}`,
            value,
          );

          moveItemBetweenLists?.({
            item,
            movedItem: { ...item, position: targetListIndex },
            sourceListId: sourceData.parentId,
            targetListId,
            targetListItems: sortedTarget,
          });
        } else {
          const list = getItemByPath(sourceData.parentId, value);
          const item = list[sourceData.id];

          moveItemBetweenLists?.({
            item,
            movedItem: item,
            sourceListId: sourceData.parentId,
            targetListId,
          });
        }
      },
    });
  }, [
    value,
    moveItemBetweenLists,
    getDestinationIndex,
    updatePosition,
    updateList,
    canDropSourceOnTarget,
    getTargetListId,
    getAxis,
    getItemByPath,
  ]);
}
