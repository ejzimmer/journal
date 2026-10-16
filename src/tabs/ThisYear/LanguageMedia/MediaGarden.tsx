import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { ComprehensionRecords } from './ComprehensionRecords';
import { MediaCactus } from './MediaCactus';
import { AddMediaButton } from './AddMediaButton';
import { MediaTree } from './MediaTree';
import { isPrintSeries } from './types';

import './MediaGarden.css';

export function MediaGarden() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul className="media-garden">
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
        return null;
      })}
      <li>
        <AddMediaButton />
      </li>
    </ul>
  );
}
