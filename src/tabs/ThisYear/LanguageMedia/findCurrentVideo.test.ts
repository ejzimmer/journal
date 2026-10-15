import { findCurrentVideo } from './findCurrentVideo';
import { Video, YoutubeChannel } from './types';

const createVideo = (id: string, changes: Partial<Video> = {}): Video => ({
  id,
  url: `https://youtu.be/${id}`,
  lengthInSeconds: 600,
  lookups: 0,
  aiQuestions: 0,
  ...changes,
});

const createChannel = (videos: Video[]): YoutubeChannel => ({
  id: 'channel',
  type: 'youtube',
  name: 'Channel',
  language: 'french',
  videos: Object.fromEntries(videos.map((video) => [video.id, video])),
});

describe('findCurrentVideo', () => {
  describe('when an earlier video is finished', () => {
    it('picks the first unfinished video, numbered by when it was added', () => {
      const channel = createChannel([
        createVideo('a', { status: 'done' }),
        createVideo('b', { upToInSeconds: 120 }),
        createVideo('c'),
      ]);

      expect(findCurrentVideo(channel)).toEqual({
        video: channel.videos!.b,
        number: 2,
      });
    });
  });

  describe('when every video is finished', () => {
    it('picks the last one', () => {
      const channel = createChannel([
        createVideo('a', { status: 'done' }),
        createVideo('b', { upToInSeconds: 600 }),
      ]);

      expect(findCurrentVideo(channel)).toEqual({
        video: channel.videos!.b,
        number: 2,
      });
    });
  });

  describe('when there are no videos', () => {
    it('finds nothing', () => {
      expect(findCurrentVideo(createChannel([]))).toBeUndefined();
    });
  });
});
