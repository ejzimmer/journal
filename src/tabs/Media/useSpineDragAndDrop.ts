import { RefObject, useEffect, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { attachClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/attach-closest-edge';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge/extract-closest-edge';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

type SpineDragData = { seriesId: string; itemId: string };

const isSpineDragData = (
  data: Record<string | symbol, unknown>,
): data is Record<string | symbol, unknown> & SpineDragData =>
  typeof data.seriesId === 'string' && typeof data.itemId === 'string';

export function useSpineDragAndDrop({
  spineRef,
  seriesId,
  itemId,
}: {
  spineRef: RefObject<HTMLLIElement | null>;
  seriesId?: string;
  itemId: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dropEdge, setDropEdge] = useState<Edge | null>(null);

  useEffect(() => {
    const element = spineRef.current;
    if (!element || !seriesId) return;

    const data: SpineDragData = { seriesId, itemId };

    return combine(
      draggable({
        element,
        getInitialData: () => data,
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element,
        canDrop: ({ source }) =>
          source.data.seriesId === seriesId && source.data.itemId !== itemId,
        getData: ({ input }) =>
          attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['left', 'right'],
          }),
        onDragEnter: ({ self }) => setDropEdge(extractClosestEdge(self.data)),
        onDrag: ({ self }) => setDropEdge(extractClosestEdge(self.data)),
        onDragLeave: () => setDropEdge(null),
        onDrop: () => setDropEdge(null),
      }),
    );
  }, [spineRef, seriesId, itemId]);

  return { isDragging, dropEdge };
}

export function useSeriesDropMonitor({
  seriesId,
  onDrop,
}: {
  seriesId?: string;
  onDrop: (itemId: string, targetId: string, edge: Edge | null) => void;
}) {
  useEffect(() => {
    if (!seriesId) return;

    return monitorForElements({
      canMonitor: ({ source }) => source.data.seriesId === seriesId,
      onDrop: ({ source, location }) => {
        const target = location.current.dropTargets[0];
        if (
          !target ||
          !isSpineDragData(source.data) ||
          !isSpineDragData(target.data)
        ) {
          return;
        }

        onDrop(
          source.data.itemId,
          target.data.itemId,
          extractClosestEdge(target.data),
        );
      },
    });
  }, [seriesId, onDrop]);
}
