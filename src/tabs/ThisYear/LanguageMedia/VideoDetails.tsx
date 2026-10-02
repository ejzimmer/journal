import {
  formatComprehension,
  formatHoursMinutesAndSeconds,
  formatStatus,
} from './format';
import { Video } from './types';

export function VideoDetails({ video }: { video: Video }) {
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
    </>
  );
}
