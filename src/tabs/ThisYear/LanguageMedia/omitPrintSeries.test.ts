import { omitPrintSeries } from './omitPrintSeries';
import { yotsuba } from './testMedia';
import { YoutubeChannel } from './types';

const channel: YoutubeChannel = {
  id: 'channel',
  type: 'youtube',
  name: 'Channel',
  language: 'japanese',
};

describe('omitPrintSeries', () => {
  describe('for a year with books, manga and other media', () => {
    it('keeps only the other media', () => {
      expect(omitPrintSeries({ 2026: { yotsuba, channel } })).toEqual({
        2026: { channel },
      });
    });
  });
});
