import { ComponentType, useRef } from 'react';
import { Destination } from '../../shared/drag-and-drop/types';
import { onChangePosition } from '../../shared/drag-and-drop/utils';
import { MediaDetails } from './types';
import { MediaEditFormProps, MediaSpine, StatusConfig } from './MediaSpine';
import { sortSeriesItems } from './seriesOrder';
import { SeriesDragAndDrop } from './SeriesDragAndDrop';

export function MediaList<T extends MediaDetails, S extends string>({
  items,
  reorderListId,
  bandHue,
  hue,
  config,
  EditForm,
  onReorder,
}: {
  items?: Record<string, T>;
  reorderListId?: string;
  bandHue?: number;
  hue: (item: T) => number;
  config: StatusConfig<T, S>;
  EditForm: ComponentType<MediaEditFormProps<T>>;
  onReorder?: (items: { id: string }[]) => void;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const sortedItems = sortSeriesItems(items);
  const dragListId =
    onReorder && sortedItems.length > 1 ? reorderListId : undefined;

  const moveItem = (index: number, destination: Destination) => {
    if (!onReorder) return;
    const positionedItems = sortedItems.map(({ id }, position) => ({
      id,
      position,
    }));
    onChangePosition(positionedItems, index, destination, onReorder);
  };

  return (
    items && (
      <>
        {dragListId && onReorder && (
          <SeriesDragAndDrop
            listId={dragListId}
            listRef={listRef}
            onReorder={onReorder}
          />
        )}
        <ol ref={listRef} className="matched-set">
          {sortedItems.map((item, index) => (
            <MediaSpine
              key={item.id}
              item={item}
              bandHue={bandHue}
              hue={hue(item)}
              config={config}
              EditForm={EditForm}
              dragListId={dragListId}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
              onMove={(destination) => moveItem(index, destination)}
            />
          ))}
        </ol>
      </>
    )
  );
}
