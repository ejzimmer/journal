import { getComprehensionRecords } from './comprehensionRecords';
import { PrintSeries, ProgressUpdate, Volume } from './types';

const createUpdate = (
  at: string,
  details: Partial<ProgressUpdate> = {},
): ProgressUpdate => ({
  at,
  lookups: 0,
  aiQuestions: 0,
  ...details,
});

const createVolume = (number: number, updates: ProgressUpdate[]): Volume => ({
  id: `vol${number}`,
  number,
  updates: Object.fromEntries(updates.map((update) => [update.at, update])),
});

const createSeries = (volumes: Volume[]): PrintSeries => ({
  id: 'series',
  type: 'book',
  name: 'Series',
  language: 'french',
  volumes: Object.fromEntries(volumes.map((volume) => [volume.id, volume])),
});

describe('getComprehensionRecords', () => {
  describe('with updates on the same day', () => {
    it('adds up what was looked up and asked that day', () => {
      const series = createSeries([
        createVolume(1, [
          createUpdate('2026-10-03T09:00:00Z', { lookups: 1 }),
          createUpdate('2026-10-03T10:00:00Z', { lookups: 4, aiQuestions: 2 }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        { date: '2026-10-03', lookups: 5, aiQuestions: 2 },
      ]);
    });

    it('keeps the last understood score that day', () => {
      const series = createSeries([
        createVolume(1, [
          createUpdate('2026-10-03T11:00:00Z', { understood: 70 }),
          createUpdate('2026-10-03T09:00:00Z', { understood: 60 }),
          createUpdate('2026-10-03T12:00:00Z', { lookups: 1 }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        { date: '2026-10-03', lookups: 1, aiQuestions: 0, understood: 70 },
      ]);
    });
  });

  describe('with updates across days and volumes', () => {
    it('lists a record per day, oldest first', () => {
      const series = createSeries([
        createVolume(2, [createUpdate('2026-10-04T09:00:00Z')]),
        createVolume(1, [createUpdate('2026-10-02T09:00:00Z')]),
      ]);

      expect(getComprehensionRecords(series).map(({ date }) => date)).toEqual([
        '2026-10-02',
        '2026-10-04',
      ]);
    });
  });
});
