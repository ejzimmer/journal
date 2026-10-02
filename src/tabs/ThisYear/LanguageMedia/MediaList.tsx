import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { MediaDetails } from './MediaDetails';

export function MediaList() {
  const { media } = useLanguageMediaStorage();

  return (
    <ul>
      {media.map((item) => (
        <li key={item.id}>
          <MediaDetails media={item} path={[item.id]} />
        </li>
      ))}
    </ul>
  );
}
