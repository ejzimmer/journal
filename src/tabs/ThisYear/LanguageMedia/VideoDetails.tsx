import { ComprehensionCounters } from './ComprehensionForms';
import { DeleteButton } from './DeleteButton';
import { EditVideoForm } from './EditVideoForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { StatusSelect } from './StatusSelect';
import { VideoUpToForm } from './VideoUpToForm';
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
      {video.lengthInSeconds === undefined ? (
        <StatusSelect
          name={video.url}
          status={video.status}
          onChange={(status) => updateItem(path, { status })}
        />
      ) : (
        <VideoUpToForm
          name={video.url}
          upToInSeconds={video.upToInSeconds}
          onChange={(upToInSeconds) => updateItem(path, { upToInSeconds })}
        />
      )}
      <ComprehensionCounters
        name={video.url}
        comprehension={video}
        onChange={(changes) => updateItem(path, changes)}
      />
      <EditVideoForm
        video={video}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={video.url} path={path} />
    </>
  );
}
