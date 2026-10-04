import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { ComprehensionRecords } from './ComprehensionRecords';
import { MediaTree } from './MediaTree';
import { LanguageMedia, PrintSeries } from './types';

import './MediaGarden.css';

const isPrintSeries = (media: LanguageMedia): media is PrintSeries =>
  media.type === 'book' || media.type === 'manga';

export function MediaGarden() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul className="media-garden">
      {media.filter(isPrintSeries).map((series) => (
        <li key={series.id}>
          <MediaTree series={series} />
          <ComprehensionRecords series={series} />
        </li>
      ))}
    </ul>
  );
}
