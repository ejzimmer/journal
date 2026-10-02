import { VideoDetails } from './VideoDetails';
import { listInAddedOrder } from './lists';
import { YoutubeChannel } from './types';

export function YoutubeChannelDetails({
  channel,
}: {
  channel: YoutubeChannel;
}) {
  return (
    <ul>
      {listInAddedOrder(channel.videos).map((video) => (
        <li key={video.id}>
          <VideoDetails video={video} />
        </li>
      ))}
    </ul>
  );
}
