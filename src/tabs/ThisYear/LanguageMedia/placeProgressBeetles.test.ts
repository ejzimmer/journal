import { placeProgressBeetles } from './placeProgressBeetles';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { PrintSeries, ProgressUpdate } from './types';

const createLimb = (amount: number): GrownShape => ({
  key: 'vol1-limb',
  amount,
  growth: { type: 'branch', level: 0, start: 0, end: 1 },
  edges: Array.from({ length: 21 }, (_, index): EdgeSample => ({
    at: index / 20,
    left: { x: index * 10, y: -98 },
    right: { x: index * 10, y: -102 },
  })),
});

const createTrunk = (): GrownShape => ({
  key: 'trunk',
  amount: 1,
  growth: { type: 'trunk', levelEnds: [1] },
  edges: Array.from({ length: 21 }, (_, index): EdgeSample => ({
    at: index / 20,
    left: { x: -4, y: -index * 10 },
    right: { x: 4, y: -index * 10 },
  })),
});

const createUpdate = (
  day: number,
  page: number,
  lookups: number,
  aiQuestions = 0,
): ProgressUpdate => ({
  at: `2026-10-0${day}T09:00:00Z`,
  page,
  lookups,
  aiQuestions,
});

const createSeries = (updates: ProgressUpdate[]): PrintSeries => ({
  id: 'series',
  type: 'manga',
  name: 'Series',
  language: 'japanese',
  volumes: {
    vol1: {
      id: 'vol1',
      number: 1,
      pages: 200,
      updates: Object.fromEntries(
        updates.map((update, index) => [`u${index + 1}`, update]),
      ),
    },
  },
  upTo: { volume: 1, page: 200 },
});

describe('placeProgressBeetles', () => {
  describe('for a volume with several updates', () => {
    const beetles = placeProgressBeetles(
      createSeries([createUpdate(1, 50, 2, 1), createUpdate(2, 150, 3)]),
      [createTrunk(), createLimb(1)],
    );
    const beetlesOf = (key: string) =>
      beetles.filter((beetle) => beetle.key.startsWith(`${key}-`));

    it('gives each update its own beetles', () => {
      expect(beetlesOf('u1').map(({ colour }) => colour)).toEqual([
        'red',
        'yellow',
        'red',
      ]);
      expect(beetlesOf('u2')).toHaveLength(3);
    });

    describe('for the first update', () => {
      it('scatters its beetles between the base of the branch and its page', () => {
        beetlesOf('u1').forEach(({ at }) => {
          expect(at).toBeGreaterThan(0.12);
          expect(at).toBeLessThan(0.25);
        });
      });
    });

    describe('for a later update', () => {
      it('spreads its beetles evenly between the previous update and its page', () => {
        expect(beetlesOf('u2').map(({ at }) => at)).toEqual([
          expect.closeTo(0.25 + 0.5 / 6),
          expect.closeTo(0.5),
          expect.closeTo(0.75 - 0.5 / 6),
        ]);
      });
    });
  });

  describe('when an update has no room for its beetles', () => {
    const trunk = createTrunk();
    const beetles = placeProgressBeetles(
      createSeries([createUpdate(1, 26, 2, 1), createUpdate(2, 60, 1)]),
      [trunk, createLimb(1)],
    );
    const onTrunk = beetles.filter(({ edges }) => edges === trunk.edges);

    it('sends them to climb the trunk', () => {
      expect(onTrunk.map(({ colour }) => colour)).toEqual([
        'red',
        'yellow',
        'red',
      ]);
    });

    it('keeps the beetles of updates that fit on the branch', () => {
      const [onBranch] = beetles.filter(({ edges }) => edges !== trunk.edges);
      expect(onBranch.key).toBe('u2-beetle-0');
    });
  });
});
