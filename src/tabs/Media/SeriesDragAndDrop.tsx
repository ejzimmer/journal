import { RefObject } from 'react';
import { useDraggableList } from '../../shared/drag-and-drop/useDraggableList';
import { useDropTarget } from '../../shared/drag-and-drop/useDropTarget';
import { isDraggable } from '../../shared/drag-and-drop/utils';

export function SeriesDragAndDrop({
  listId,
  listRef,
  onReorder,
}: {
  listId: string;
  listRef: RefObject<HTMLOListElement | null>;
  onReorder: (items: { id: string }[]) => void;
}) {
  useDropTarget({
    dropTargetRef: listRef,
    canDrop: ({ source }) =>
      isDraggable(source.data) && source.data.parentId === listId,
    getData: () => ({ listId }),
  });
  useDraggableList({
    listId,
    canDropSourceOnTarget: (source) => source.parentId === listId,
    getTargetListId: (source) => source.parentId,
    getAxis: () => 'horizontal',
    updateList: (_listId, items) => onReorder(items),
  });

  return null;
}
