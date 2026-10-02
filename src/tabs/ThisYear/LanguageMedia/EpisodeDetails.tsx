import { DeleteButton } from './DeleteButton';
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
  const name = formatEpisodeName(episode);

  return (
    <>
      {name}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
      <DeleteButton name={name} path={path} />
    </>
  );
}
