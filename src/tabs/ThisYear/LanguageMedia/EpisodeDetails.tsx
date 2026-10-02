import { DeleteButton } from './DeleteButton';
import { EditEpisodeForm } from './EditEpisodeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import {
  formatComprehension,
  formatEpisodeName,
  formatMinutesAndSeconds,
  formatStatus,
} from './format';
import { Episode, ItemPath } from './types';

export function EpisodeDetails({
  episode,
  path,
}: {
  episode: Episode;
  path: ItemPath;
}) {
  const { updateItem } = useLanguageMediaStorage();
  const name = formatEpisodeName(episode);

  return (
    <>
      {name}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
      <EditEpisodeForm
        name={name}
        episode={episode}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
    </>
  );
}
