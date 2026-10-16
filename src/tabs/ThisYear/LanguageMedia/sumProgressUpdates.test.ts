import { sumProgressUpdates } from './sumProgressUpdates';
import { Volume } from './types';

describe('sumProgressUpdates', () => {
  describe('for a volume with updates', () => {
    const volume: Volume = {
      id: 'vol1',
      number: 1,
      updates: {
        u2: {
          at: '2026-10-03T10:00:00Z',
          lookups: 2,
          aiQuestions: 0,
        },
        u1: {
          at: '2026-10-01T10:00:00Z',
          lookups: 3,
          aiQuestions: 1,
          understood: 60,
        },
      },
    };

    it('adds up the look-ups and AI questions', () => {
      expect(sumProgressUpdates(volume)).toMatchObject({
        lookups: 5,
        aiQuestions: 1,
      });
    });

    it('takes understood from the latest update that has one', () => {
      expect(sumProgressUpdates(volume).understood).toBe(60);
    });
  });

  describe('for a volume with no updates', () => {
    it('counts nothing', () => {
      expect(sumProgressUpdates({ id: 'vol1', number: 1 })).toEqual({
        lookups: 0,
        aiQuestions: 0,
        understood: undefined,
      });
    });
  });
});
