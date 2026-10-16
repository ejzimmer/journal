import { sumReadings } from './sumReadings';
import { Volume } from './types';

describe('sumReadings', () => {
  describe('for a volume with readings', () => {
    const volume: Volume = {
      id: 'vol1',
      number: 1,
      readings: {
        r2: {
          id: 'r2',
          createdAt: '2026-10-03T10:00:00Z',
          lookups: 2,
          aiQuestions: 0,
        },
        r1: {
          id: 'r1',
          createdAt: '2026-10-01T10:00:00Z',
          lookups: 3,
          aiQuestions: 1,
          understood: 60,
        },
      },
    };

    it('adds up the look-ups and AI questions', () => {
      expect(sumReadings(volume)).toMatchObject({ lookups: 5, aiQuestions: 1 });
    });

    it('takes understood from the latest reading that has one', () => {
      expect(sumReadings(volume).understood).toBe(60);
    });
  });

  describe('for a volume with no readings', () => {
    it('counts nothing', () => {
      expect(sumReadings({ id: 'vol1', number: 1 })).toEqual({
        lookups: 0,
        aiQuestions: 0,
        understood: undefined,
      });
    });
  });
});
