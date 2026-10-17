import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { MediaDetails } from './MediaDetails';
import { LanguageMedia, TvSeries } from './types';

const isTvSeries = (media: LanguageMedia): media is TvSeries =>
  media.type === 'tv';

export function MediaList() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul>
      {media.filter(isTvSeries).map((item) => (
        <li key={item.id}>
          <MediaDetails media={item} path={[item.id]} />
        </li>
      ))}
    </ul>
  );
}
