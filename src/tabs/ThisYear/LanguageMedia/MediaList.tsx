import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { MediaDetails } from './MediaDetails';
import { isPrintSeries, LanguageMedia } from './types';

const isUnplanted = (media: LanguageMedia) => !isPrintSeries(media);

export function MediaList() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul>
      {media.filter(isUnplanted).map((item) => (
        <li key={item.id}>
          <MediaDetails media={item} path={[item.id]} />
        </li>
      ))}
    </ul>
  );
}
