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
  describe('for each update', () => {
    it('lists the date it was saved, with what was looked up, asked and understood', () => {
      const series = createSeries([
        createVolume(1, [
          createUpdate('2026-10-03T09:00:00Z', {
            lookups: 4,
            aiQuestions: 2,
            understood: 70,
          }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        {
          key: '2026-10-03T09:00:00Z',
          date: '2026-10-03',
          lookups: 4,
          aiQuestions: 2,
          understood: 70,
        },
      ]);
    });
  });

  describe('with several updates on the same day', () => {
    it('lists each of them', () => {
      const series = createSeries([
        createVolume(1, [
          createUpdate('2026-10-03T09:00:00Z', { lookups: 1 }),
          createUpdate('2026-10-03T10:00:00Z', { lookups: 4 }),
        ]),
      ]);

      expect(
        getComprehensionRecords(series).map(({ lookups }) => lookups),
      ).toEqual([1, 4]);
    });
  });

  describe('with updates across volumes', () => {
    it('lists them oldest first', () => {
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
