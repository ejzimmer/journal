import { readVideoProgress } from './videoProgress';
import { Video } from './types';

const video: Video = {
  id: 'v1',
  url: 'https://youtu.be/1',
  lengthInSeconds: 1200,
  lookups: 0,
  aiQuestions: 0,
};

describe('readVideoProgress', () => {
  describe('when the video is marked done', () => {
    it('has finished it', () => {
      expect(readVideoProgress({ ...video, status: 'done' })).toBe(1);
    });
  });

  describe('when I am part way through the video', () => {
    it('has watched up to that point', () => {
      expect(readVideoProgress({ ...video, upToInSeconds: 300 })).toBe(0.25);
    });
  });

  describe('when I have not started the video', () => {
    it('has not watched any of it', () => {
      expect(readVideoProgress(video)).toBe(0);
    });
  });

  describe('when the video has no length', () => {
    it('cannot tell how far through I am', () => {
      expect(
        readVideoProgress({
          ...video,
          lengthInSeconds: undefined,
          upToInSeconds: 300,
        }),
      ).toBe(0);
    });
  });
});
