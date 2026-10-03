import { ComponentType } from 'react';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { Destination } from '../../shared/drag-and-drop/types';
import { MediaDetails } from './types';
import { MediaEditFormProps, MediaSpine, StatusConfig } from './MediaSpine';
import { dropSeriesItem, moveSeriesItem, sortSeriesItems } from './seriesOrder';
import { useSeriesDropMonitor } from './useSpineDragAndDrop';

export function MediaList<T extends MediaDetails, S extends string>({
  items,
  seriesId,
  bandHue,
  hue,
  config,
  EditForm,
  onReorder,
}: {
  items?: Record<string, T>;
  seriesId?: string;
  bandHue?: number;
  hue: (item: T) => number;
  config: StatusConfig<T, S>;
  EditForm: ComponentType<MediaEditFormProps<T>>;
  onReorder?: (items: T[]) => void;
}) {
  const sortedItems = sortSeriesItems(items);
  const reorderSeriesId =
    onReorder && sortedItems.length > 1 ? seriesId : undefined;

  const moveItem = (index: number, destination: Destination) => {
    onReorder?.(moveSeriesItem(sortedItems, index, destination));
  };

  const dropItem = (itemId: string, targetId: string, edge: Edge | null) => {
    onReorder?.(dropSeriesItem({ items: sortedItems, itemId, targetId, edge }));
  };

  useSeriesDropMonitor({ seriesId: reorderSeriesId, onDrop: dropItem });

  return (
    items && (
      <ul className="matched-set">
        {sortedItems.map((item, index) => (
          <MediaSpine
            key={item.id}
            item={item}
            bandHue={bandHue}
            hue={hue(item)}
            config={config}
            EditForm={EditForm}
            reorderSeriesId={reorderSeriesId}
            isFirst={index === 0}
            isLast={index === sortedItems.length - 1}
            onMove={(destination) => moveItem(index, destination)}
          />
        ))}
      </ul>
    )
  );
}
