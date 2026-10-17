import { DeleteButton } from './DeleteButton';
import { EditMediaForm } from './EditMediaForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { TvSeriesDetails } from './TvSeriesDetails';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import { ItemPath, TvSeries } from './types';

export function MediaDetails({
  media,
  path,
}: {
  media: TvSeries;
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
      <TvSeriesDetails series={media} path={path} />
    </>
  );
}
