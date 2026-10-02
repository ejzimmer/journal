import { ComprehensionCounters } from './ComprehensionForms';
import { DeleteButton } from './DeleteButton';
import { EditEpisodeForm } from './EditEpisodeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { StatusSelect } from './StatusSelect';
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
      {episode.lengthInSeconds === undefined && (
        <StatusSelect
          name={name}
          status={episode.status}
          onChange={(status) => updateItem(path, { status })}
        />
      )}
      <ComprehensionCounters
        name={name}
        comprehension={episode}
        onChange={(changes) => updateItem(path, changes)}
      />
      <EditEpisodeForm
        name={name}
        episode={episode}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
    </>
  );
}
