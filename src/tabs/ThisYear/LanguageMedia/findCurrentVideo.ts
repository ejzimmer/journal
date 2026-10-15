import { getItemsInAddedOrder } from './lists';
import { YoutubeChannel } from './types';
import { readVideoProgress } from './videoProgress';

export function findCurrentVideo({ videos }: YoutubeChannel) {
  const ordered = getItemsInAddedOrder(videos);
  const index = ordered.findIndex((video) => readVideoProgress(video) < 1);
  const currentIndex = index === -1 ? ordered.length - 1 : index;
  return currentIndex === -1
    ? undefined
    : { video: ordered[currentIndex], number: currentIndex + 1 };
}
