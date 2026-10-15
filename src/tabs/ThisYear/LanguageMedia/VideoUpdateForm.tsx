import { ComprehensionUpdateForm } from './ComprehensionUpdateForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { TimeTile } from './TimeTile';
import { readDuration } from './fields';
import { Comprehension, Video, YoutubeChannel } from './types';

type VideoUpdateFormProps = {
  channel: YoutubeChannel;
  video: Video;
  number: number;
};

export function VideoUpdateForm({
  channel,
  video,
  number,
}: VideoUpdateFormProps) {
  const { updateItem } = useLanguageMediaStorage();
  const path = [channel.id, 'videos', video.id];

  const saveProgress = (data: FormData, changes: Comprehension) => {
    const upToInSeconds = readDuration(data, 'upTo');
    updateItem(
      path,
      upToInSeconds === undefined ? changes : { ...changes, upToInSeconds },
    );
  };

  return (
    <ComprehensionUpdateForm
      title={`${channel.name} ${number}`}
      name={`Video ${number}`}
      path={path}
      comprehension={video}
      flowerType={channel.type}
      positionTile={
        <TimeTile
          upToInSeconds={video.upToInSeconds}
          lengthInSeconds={video.lengthInSeconds}
        />
      }
      onSave={saveProgress}
    />
  );
}
