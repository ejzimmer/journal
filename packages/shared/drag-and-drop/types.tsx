import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

export type Destination = 'start' | 'previous' | 'next' | 'end';

export type DraggingState =
  | { type: 'idle' }
  | { type: 'preview'; container: HTMLElement }
  | {
      type: 'is-dragging-over';
      closestEdge: Edge | null;
      sourceData: Record<string | symbol, unknown>;
    };
export type SourceState = 'idle' | 'in-place' | 'moved';

export const IDLE: DraggingState = { type: 'idle' };

export type SortableItem = {
  id: string;
  position: number;
};

export type OrderedListItem = SortableItem & {
  parentId: string;
};

export const draggableTypeKey = Symbol('draggableType');

export type Draggable = {
  id: string;
  parentId: string;
  [draggableTypeKey]: string;
};

export type DropTarget = {
  id: string;
  axis: 'horizontal' | 'vertical';
};
