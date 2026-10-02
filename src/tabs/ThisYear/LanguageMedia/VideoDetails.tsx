import { DeleteButton } from './DeleteButton';
import { EditVideoForm } from './EditVideoForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
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
  const { updateItem } = useLanguageMediaStorage();
  return (
    <>
      {video.url}
      {video.lengthInSeconds !== undefined &&
        ` (${formatHoursMinutesAndSeconds(video.lengthInSeconds)})`}
      {video.upToInSeconds !== undefined &&
        `, up to ${formatHoursMinutesAndSeconds(video.upToInSeconds)}`}
      {formatStatus(video.status)}: {formatComprehension(video)}
      <EditVideoForm
        video={video}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={video.url} path={path} />
    </>
  );
}
