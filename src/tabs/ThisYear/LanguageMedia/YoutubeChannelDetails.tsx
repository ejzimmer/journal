import { VideoDetails } from './VideoDetails';
import { listInAddedOrder } from './lists';
import { ItemPath, YoutubeChannel } from './types';

export function YoutubeChannelDetails({
  channel,
  path,
}: {
  channel: YoutubeChannel;
  path: ItemPath;
}) {
  return (
    <ul>
      {listInAddedOrder(channel.videos).map((video) => (
        <li key={video.id}>
          <VideoDetails video={video} path={[...path, 'videos', video.id]} />
        </li>
      ))}
    </ul>
  );
}
