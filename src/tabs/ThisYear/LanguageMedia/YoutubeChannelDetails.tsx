import { AddVideoForm } from './AddVideoForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { VideoDetails } from './VideoDetails';
import { getItemsInAddedOrder } from './lists';
import { ItemPath, YoutubeChannel } from './types';

export function YoutubeChannelDetails({
  channel,
  path,
}: {
  channel: YoutubeChannel;
  path: ItemPath;
}) {
  const { addItem } = useLanguageMediaStorage();

  return (
    <>
      <ul>
        {getItemsInAddedOrder(channel.videos).map((video) => (
          <li key={video.id}>
            <VideoDetails video={video} path={[...path, 'videos', video.id]} />
          </li>
        ))}
      </ul>
      <AddVideoForm onAdd={(video) => addItem([...path, 'videos'], video)} />
    </>
  );
}
