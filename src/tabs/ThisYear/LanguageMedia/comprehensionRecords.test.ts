import { getComprehensionRecords } from './comprehensionRecords';
import { PrintSeries, Reading, Volume } from './types';

const createReading = (
  createdAt: string,
  details: Partial<Reading> = {},
): Reading => ({
  id: createdAt,
  createdAt,
  lookups: 0,
  aiQuestions: 0,
  ...details,
});

const createVolume = (number: number, readings: Reading[]): Volume => ({
  id: `vol${number}`,
  number,
  readings: Object.fromEntries(
    readings.map((reading) => [reading.id, reading]),
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
  describe('with readings on the same day', () => {
    it('adds up what was looked up and asked that day', () => {
      const series = createSeries([
        createVolume(1, [
          createReading('2026-10-03T09:00:00Z', { lookups: 1 }),
          createReading('2026-10-03T10:00:00Z', { lookups: 4, aiQuestions: 2 }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        { date: '2026-10-03', lookups: 5, aiQuestions: 2 },
      ]);
    });

    it('keeps the last understood score that day', () => {
      const series = createSeries([
        createVolume(1, [
          createReading('2026-10-03T11:00:00Z', { understood: 70 }),
          createReading('2026-10-03T09:00:00Z', { understood: 60 }),
          createReading('2026-10-03T12:00:00Z', { lookups: 1 }),
        ]),
      ]);

      expect(getComprehensionRecords(series)).toEqual([
        { date: '2026-10-03', lookups: 1, aiQuestions: 0, understood: 70 },
      ]);
    });
  });

  describe('with readings across days and volumes', () => {
    it('lists a record per day, oldest first', () => {
      const series = createSeries([
        createVolume(2, [createReading('2026-10-04T09:00:00Z')]),
        createVolume(1, [createReading('2026-10-02T09:00:00Z')]),
      ]);

      expect(getComprehensionRecords(series).map(({ date }) => date)).toEqual([
        '2026-10-02',
        '2026-10-04',
      ]);
    });
  });
});
