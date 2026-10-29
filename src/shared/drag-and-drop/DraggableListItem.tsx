import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { ReactNode, useRef, useState, useEffect, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import {
  Draggable,
  DraggingState,
  IDLE,
  SourceState,
  draggableTypeKey,
} from './types';

import './drag-and-drop.css';

type DraggableListItemProps = {
  getData: () => Draggable;
  dragPreview: ReactNode;
  isDroppable: (data: any) => boolean;
  allowedEdges: Edge[];
  dragHandle: ReactElement;
  renderDropIndicator?: (
    sourceData: Record<string | symbol, unknown>,
    edge: Edge,
  ) => ReactNode;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function DraggableListItem({
  getData,
  dragPreview,
  isDroppable,
  allowedEdges,
  dragHandle,
  renderDropIndicator,
  children,
  className,
  style,
}: DraggableListItemProps) {
  const listItemRef = useRef<HTMLLIElement | null>(null);
  const dragHandleMountRef = useRef<HTMLSpanElement | null>(null);
  const [draggingState, setDraggingState] = useState<DraggingState>(IDLE);
  const [sourceState, setSourceState] = useState<SourceState>('idle');

  useEffect(() => {
    const row = listItemRef.current;
    const dragSource = dragHandleMountRef.current;
    if (!row || !dragSource) return;

    invariant(row);
    invariant(dragSource);
    return combine(
      draggable({
        element: dragSource,
        getInitialData() {
          return getData();
        },
        onGenerateDragPreview({ nativeSetDragImage, location }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: row,
              input: location.current.input,
            }),
            render({ container }) {
              setDraggingState({ type: 'preview', container });
            },
          });
        },
        onDragStart() {
          setSourceState('in-place');
        },
        onDrag({ location }) {
          const isOverAnotherItem = location.current.dropTargets.some(
            (target) =>
              target.element !== row && extractClosestEdge(target.data),
          );
          setSourceState(isOverAnotherItem ? 'moved' : 'in-place');
        },
        onDrop() {
          setDraggingState(IDLE);
          setSourceState('idle');
        },
      }),
      dropTargetForElements({
        element: row,
        canDrop({ source }) {
          const sourceData = source.data as Draggable;
          const targetData = getData();
          if (
            sourceData.id === targetData.id &&
            sourceData.parentId === targetData.parentId &&
            sourceData[draggableTypeKey] === targetData[draggableTypeKey]
          ) {
            return false;
          }
          return isDroppable(source.data);
        },
        getData({ input }) {
          const data = getData();
          return attachClosestEdge(data, {
            element: renderDropIndicator ? dragSource : row,
            input,
            allowedEdges,
          });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self, source }) {
          const closestEdge = extractClosestEdge(self.data);
          setDraggingState({
            type: 'is-dragging-over',
            closestEdge,
            sourceData: source.data,
          });
        },
        onDrag({ self, source }) {
          const closestEdge = extractClosestEdge(self.data);

          setDraggingState((current) => {
            if (
              current.type === 'is-dragging-over' &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return {
              type: 'is-dragging-over',
              closestEdge,
              sourceData: source.data,
            };
          });
        },
        onDragLeave() {
          setDraggingState(IDLE);
        },
        onDrop() {
          setDraggingState(IDLE);
        },
      }),
    );
  }, [allowedEdges, getData, isDroppable, renderDropIndicator]);

  return (
    <>
      <li
        ref={listItemRef}
        className={`${className ?? ''} draggable-item`}
        data-drag-source={sourceState === 'idle' ? undefined : sourceState}
        style={style}
      >
        <span ref={dragHandleMountRef} className="drag-handle-mount">
          {dragHandle}
        </span>
        {children}
        {draggingState.type === 'is-dragging-over' &&
        draggingState.closestEdge ? (
          renderDropIndicator ? (
            renderDropIndicator(
              draggingState.sourceData,
              draggingState.closestEdge,
            )
          ) : (
            <DropIndicator edge={draggingState.closestEdge} />
          )
        ) : null}
      </li>
      {draggingState.type === 'preview' &&
        createPortal(dragPreview, draggingState.container)}
    </>
  );
}

function DropIndicator({ edge }: { edge: Edge }) {
  return <div className={`drop-indicator ${edge}`} />;
}
