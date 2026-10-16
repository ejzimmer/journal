import { placeBeetleClumps } from './placeBeetleClumps';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { PrintSeries, Reading } from './types';

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

const createReading = (
  id: string,
  page: number,
  lookups: number,
  aiQuestions = 0,
): Reading => ({
  id,
  createdAt: `2026-10-0${id.at(-1)}T09:00:00Z`,
  page,
  lookups,
  aiQuestions,
});

const createSeries = (readings: Reading[]): PrintSeries => ({
  id: 'series',
  type: 'manga',
  name: 'Series',
  language: 'japanese',
  volumes: {
    vol1: {
      id: 'vol1',
      number: 1,
      pages: 200,
      readings: Object.fromEntries(
        readings.map((reading) => [reading.id, reading]),
      ),
    },
  },
  upTo: { volume: 1, page: 200 },
});

const centreOf = (ats: number[]) => (ats[0] + ats.at(-1)!) / 2;

describe('placeBeetleClumps', () => {
  describe('for a volume with several readings', () => {
    const limb = createLimb(1);
    const beetles = placeBeetleClumps(
      createSeries([
        createReading('r1', 50, 2, 1),
        createReading('r2', 150, 3),
      ]),
      [createTrunk(), limb],
    );
    const clump = (id: string) =>
      beetles.filter(({ key }) => key.startsWith(`${id}-`));

    it('gives each reading its own clump of beetles', () => {
      expect(clump('r1').map(({ colour }) => colour)).toEqual([
        'red',
        'yellow',
        'red',
      ]);
      expect(clump('r2')).toHaveLength(3);
    });

    it('centres each clump on the page the reading was saved at', () => {
      expect(centreOf(clump('r1').map(({ at }) => at))).toBeCloseTo(0.25);
      expect(centreOf(clump('r2').map(({ at }) => at))).toBeCloseTo(0.75);
    });

    it('packs the beetles of a clump side by side', () => {
      const [first, second] = clump('r1');
      expect((second.at - first.at) * first.length).toBeCloseTo(5);
    });
  });

  describe('for a reading near the base of the branch', () => {
    it('keeps the clump off the trunk end of the branch', () => {
      const beetles = placeBeetleClumps(
        createSeries([createReading('r1', 20, 3)]),
        [createLimb(1)],
      );

      expect(beetles[0].range[0]).toBeCloseTo(0.12);
    });
  });

  describe('when the branch has no room left for a clump', () => {
    const trunk = createTrunk();
    const beetles = placeBeetleClumps(
      createSeries([createReading('r1', 20, 2), createReading('r2', 30, 1, 2)]),
      [trunk, createLimb(0.29)],
    );

    it('fits what it can on the branch', () => {
      expect(beetles.filter(({ edges }) => edges !== trunk.edges)).toHaveLength(
        3,
      );
    });

    it('sends the rest to climb the trunk', () => {
      expect(
        beetles
          .filter(({ edges }) => edges === trunk.edges)
          .map(({ colour }) => colour),
      ).toEqual(['yellow', 'yellow']);
    });
  });
});
