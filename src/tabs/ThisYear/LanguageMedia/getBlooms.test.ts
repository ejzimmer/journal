import { getBlooms } from './getBlooms';
import { PrintSeries, Reading, Volume } from './types';

const createReading = (
  id: string,
  createdAt: string,
  details: Partial<Reading>,
): Reading => ({ id, createdAt, lookups: 0, aiQuestions: 0, ...details });

const createVolume = (number: number, readings: Reading[]): Volume => ({
  id: `vol${number}`,
  number,
  pages: 200,
  readings: Object.fromEntries(
    readings.map((reading) => [reading.id, reading]),
  ),
});

const createSeries = (
  volumes: Volume[],
  upTo: PrintSeries['upTo'],
): PrintSeries => ({
  id: 'series',
  type: 'book',
  name: 'Series',
  language: 'french',
  volumes: Object.fromEntries(volumes.map((volume) => [volume.id, volume])),
  upTo,
});

describe('getBlooms', () => {
  describe('for a volume with readings', () => {
    const series = createSeries(
      [
        createVolume(1, [
          createReading('r2', '2026-10-03T10:00:00Z', {
            page: 100,
            understood: 55,
          }),
          createReading('r1', '2026-10-01T10:00:00Z', {
            page: 50,
            understood: 40,
          }),
          createReading('r3', '2026-10-04T10:00:00Z', {
            page: 120,
            lookups: 3,
          }),
        ]),
      ],
      { volume: 1, page: 150 },
    );

    it('grows a flower for each reading that says how much was understood, at its page, in the order they were saved', () => {
      expect(getBlooms(series)).toEqual([
        { key: 'r1', limbKey: 'vol1-limb', at: 0.25, understood: 40 },
        { key: 'r2', limbKey: 'vol1-limb', at: 0.5, understood: 55 },
      ]);
    });
  });

  describe('for a reading with no page', () => {
    it('puts the flower where reading is up to now', () => {
      const series = createSeries(
        [
          createVolume(1, [
            createReading('r1', '2026-10-01T10:00:00Z', { understood: 40 }),
          ]),
        ],
        { volume: 1, page: 120 },
      );

      expect(getBlooms(series)[0].at).toBe(0.6);
    });
  });

  describe('for a reading past where the volume is up to now', () => {
    it('keeps the flower on the grown part of the branch', () => {
      const series = createSeries(
        [
          createVolume(1, [
            createReading('r1', '2026-10-01T10:00:00Z', {
              page: 180,
              understood: 40,
            }),
          ]),
        ],
        { volume: 1, page: 100 },
      );

      expect(getBlooms(series)[0].at).toBe(0.5);
    });
  });

  describe('when reading was barely started', () => {
    it('keeps the flower a little way out from the trunk', () => {
      const series = createSeries(
        [
          createVolume(1, [
            createReading('r1', '2026-10-01T10:00:00Z', {
              page: 2,
              understood: 10,
            }),
          ]),
        ],
        { volume: 1, page: 2 },
      );

      expect(getBlooms(series)[0].at).toBe(0.1);
    });
  });
});
