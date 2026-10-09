import { getComprehensionRecords } from './comprehensionRecords';
import { ItemUpdate, PrintSeries, Volume } from './types';

const createUpdate = (
  at: string,
  changes: ItemUpdate['changes'],
): ItemUpdate => ({ at, changes });

const createVolume = (number: number, updates: ItemUpdate[]): Volume => ({
  id: `vol${number}`,
  number,
  lookups: 0,
  aiQuestions: 0,
  updates: Object.fromEntries(
    updates.map((update, index) => [`u${index}`, update]),
  ),
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
          createUpdate('2026-10-03T09:00:00Z', {
            lookups: { from: 4, to: 5 },
          }),
          createUpdate('2026-10-03T10:00:00Z', {
            lookups: { from: 5, to: 9 },
            aiQuestions: { to: 2 },
          }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        { date: '2026-10-03', lookups: 5, aiQuestions: 2 },
      ]);
    });

    it('keeps the last understood score that day', () => {
      const series = createSeries([
        createVolume(1, [
          createUpdate('2026-10-03T09:00:00Z', {
            understood: { from: 50, to: 60 },
          }),
          createUpdate('2026-10-03T11:00:00Z', {
            understood: { from: 60, to: 70 },
          }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        { date: '2026-10-03', lookups: 0, aiQuestions: 0, understood: 70 },
      ]);
    });
  });

  describe('with updates across days and volumes', () => {
    it('lists a record per day, oldest first', () => {
      const series = createSeries([
        createVolume(2, [
          createUpdate('2026-10-04T09:00:00Z', {
            lookups: { from: 0, to: 3 },
          }),
        ]),
        createVolume(1, [
          createUpdate('2026-10-02T09:00:00Z', {
            lookups: { from: 0, to: 1 },
          }),
        ]),
      ]);

      expect(getComprehensionRecords(series).map(({ date }) => date)).toEqual([
        '2026-10-02',
        '2026-10-04',
      ]);
    });
  });

  describe('with updates to other fields', () => {
    it('leaves them out of the records', () => {
      const series = createSeries([
        createVolume(1, [
          createUpdate('2026-10-03T09:00:00Z', {
            status: { to: 'done' },
          }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([]);
    });
  });
});
