import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { MediaTree } from './MediaTree';
import { isPrintSeries } from './types';

import './MediaGarden.css';

export function MediaGarden() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul className="media-garden">
      {media.filter(isPrintSeries).map((series) => (
        <li key={series.id}>
          <MediaTree series={series} />
        </li>
      ))}
    </ul>
  );
}
