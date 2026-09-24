import { ComponentType } from 'react';
import { MediaDetails } from './types';
import { MediaEditFormProps, MediaSpine, StatusConfig } from './MediaSpine';

export function MediaList<T extends MediaDetails, S extends string>({
  items,
  bandHue,
  hue,
  config,
  EditForm,
}: {
  items?: Record<string, T>;
  bandHue?: number;
  hue: (item: T) => number;
  config: StatusConfig<T, S>;
  EditForm: ComponentType<MediaEditFormProps<T>>;
}) {
  const itemDetails = items ? Object.values(items) : undefined;

  return (
    itemDetails && (
      <ul className="matched-set">
        {itemDetails.map((item) => (
          <MediaSpine
            key={item.id}
            item={item}
            bandHue={bandHue}
            hue={hue(item)}
            config={config}
            EditForm={EditForm}
          />
        ))}
      </ul>
    )
  );
}
