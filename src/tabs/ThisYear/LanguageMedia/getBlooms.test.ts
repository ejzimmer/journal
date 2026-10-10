import { getBlooms } from './getBlooms';
import { ItemUpdate, PrintSeries, Volume } from './types';

const understoodUpdate = (at: string, to: number): ItemUpdate => ({
  at,
  changes: { understood: { to } },
});

const upToUpdate = (
  at: string,
  from: PrintSeries['upTo'],
  to: PrintSeries['upTo'],
): ItemUpdate => ({ at, changes: { upTo: { from, to } } });

const createVolume = (
  number: number,
  updates: Record<string, ItemUpdate> = {},
): Volume => ({
  id: `vol${number}`,
  number,
  pages: 200,
  lookups: 0,
  aiQuestions: 0,
  updates,
});

const createSeries = (
  volumes: Volume[],
  overrides: Partial<PrintSeries> = {},
): PrintSeries => ({
  id: 'series',
  type: 'book',
  name: 'Series',
  language: 'french',
  volumes: Object.fromEntries(volumes.map((volume) => [volume.id, volume])),
  ...overrides,
});

describe('getBlooms', () => {
  describe('for a volume with understood updates', () => {
    const series = createSeries(
      [
        createVolume(1, {
          u1: understoodUpdate('2026-10-01T10:00:00Z', 40),
          u2: understoodUpdate('2026-10-03T10:00:00Z', 55),
          u3: { at: '2026-10-04T10:00:00Z', changes: { lookups: { to: 3 } } },
        }),
      ],
      {
        upTo: { volume: 1, page: 150 },
        updates: {
          p1: upToUpdate('2026-10-01T09:59:59Z', undefined, {
            volume: 1,
            page: 50,
          }),
          p2: upToUpdate(
            '2026-10-03T09:59:59Z',
            { volume: 1, page: 50 },
            { volume: 1, page: 100 },
          ),
          p3: upToUpdate(
            '2026-10-05T09:59:59Z',
            { volume: 1, page: 100 },
            { volume: 1, page: 150 },
          ),
        },
      },
    );

    it('grows a flower for each one, where reading was up to at the time', () => {
      expect(getBlooms(series)).toEqual([
        { key: 'u1', limbKey: 'vol1-limb', at: 0.25, understood: 40 },
        { key: 'u2', limbKey: 'vol1-limb', at: 0.5, understood: 55 },
      ]);
    });
  });

  describe('when an update came before any page was saved', () => {
    it('puts the flower where reading was up to before the first page was saved', () => {
      const series = createSeries(
        [createVolume(1, { u1: understoodUpdate('2026-10-01T10:00:00Z', 40) })],
        {
          upTo: { volume: 1, page: 150 },
          updates: {
            p1: upToUpdate(
              '2026-10-02T10:00:00Z',
              { volume: 1, page: 80 },
              { volume: 1, page: 150 },
            ),
          },
        },
      );

      expect(getBlooms(series)[0].at).toBe(0.4);
    });
  });

  describe('when the series has no page history', () => {
    it('puts the flower where reading is up to now', () => {
      const series = createSeries(
        [createVolume(1, { u1: understoodUpdate('2026-10-01T10:00:00Z', 40) })],
        { upTo: { volume: 1, page: 120 } },
      );

      expect(getBlooms(series)[0].at).toBe(0.6);
    });
  });

  describe('when reading was barely started', () => {
    it('keeps the flower a little way out from the trunk', () => {
      const series = createSeries(
        [createVolume(1, { u1: understoodUpdate('2026-10-01T10:00:00Z', 10) })],
        { upTo: { volume: 1, page: 2 } },
      );

      expect(getBlooms(series)[0].at).toBe(0.1);
    });
  });
});
