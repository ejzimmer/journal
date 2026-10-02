import { DeleteButton } from './DeleteButton';
import { EditMediaForm } from './EditMediaForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { PrintSeriesDetails } from './PrintSeriesDetails';
import { TvSeriesDetails } from './TvSeriesDetails';
import { YoutubeChannelDetails } from './YoutubeChannelDetails';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import { ItemPath, LanguageMedia } from './types';

export function MediaDetails({
  media,
  path,
}: {
  media: LanguageMedia;
  path: ItemPath;
}) {
  const { updateItem } = useLanguageMediaStorage();

  return (
    <>
      {media.name}, {LANGUAGE_NAMES[media.language]}{' '}
      {MEDIA_TYPE_NAMES[media.type]}
      <EditMediaForm
        media={media}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={media.name} path={path} />
      {media.type === 'tv' && <TvSeriesDetails series={media} path={path} />}
      {media.type === 'youtube' && (
        <YoutubeChannelDetails channel={media} path={path} />
      )}
      {(media.type === 'manga' || media.type === 'book') && (
        <PrintSeriesDetails series={media} path={path} />
      )}
    </>
  );
}
