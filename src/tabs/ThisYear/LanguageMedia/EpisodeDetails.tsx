import {
  formatComprehension,
  formatEpisodeName,
  formatMinutesAndSeconds,
  formatStatus,
} from './format';
import { Episode } from './types';

export function EpisodeDetails({ episode }: { episode: Episode }) {
  return (
    <>
      {formatEpisodeName(episode)}
      {episode.lengthInSeconds !== undefined &&
        ` (${formatMinutesAndSeconds(episode.lengthInSeconds)})`}
      {formatStatus(episode.status)}: {formatComprehension(episode)}
    </>
  );
}
