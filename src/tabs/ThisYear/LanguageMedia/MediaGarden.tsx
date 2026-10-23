import { useRef } from 'react';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { ComprehensionRecords } from './ComprehensionRecords';
import { MediaCactus } from './MediaCactus';
import { AddMediaButton } from './AddMediaButton';
import { MediaTree } from './MediaTree';
import { MediaVine } from './MediaVine';
import { GardenScenery } from './GardenScenery';
import { useHorizon } from './useHorizon';
import { isPrintSeries } from './types';

import './MediaGarden.css';

export function MediaGarden() {
  const { media } = useLanguageMediaStorage();
  const listRef = useRef<HTMLUListElement>(null);
  const horizon = useHorizon(listRef);

  return (
    <div className="garden">
      {horizon !== undefined && <GardenScenery horizon={horizon} />}
      <ul ref={listRef} className="media-garden">
        {media.map((item) => {
          if (isPrintSeries(item)) {
            return (
              <li key={item.id}>
                <MediaTree series={item} />
                <ComprehensionRecords series={item} />
              </li>
            );
          }
          if (item.type === 'youtube') {
            return (
              <li key={item.id}>
                <MediaCactus channel={item} />
              </li>
            );
          }
          return (
            <li key={item.id}>
              <MediaVine series={item} />
            </li>
          );
        })}
        <li>
          <AddMediaButton />
        </li>
      </ul>
    </div>
  );
}
