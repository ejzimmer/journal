import { DeleteButton } from './DeleteButton';
import {
  formatComprehension,
  formatHoursMinutesAndSeconds,
  formatStatus,
} from './format';
import { ItemPath, Video } from './types';

export function VideoDetails({
  video,
  path,
}: {
  video: Video;
  path: ItemPath;
}) {
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
      <DeleteButton name={video.url} path={path} />
    </>
  );
}
