import { createTreeLayout } from './treeLayout';
import { PrintSeries, Volume } from './types';

const createVolume = (number: number, pages?: number): Volume => ({
  id: `vol${number}`,
  number,
  pages,
  lookups: 0,
  aiQuestions: 0,
});

const createSeries = (
  volumes: Volume[],
  overrides: Partial<PrintSeries> = {},
): PrintSeries => ({
  id: 'hugo',
  type: 'book',
  name: 'Les Misérables',
  language: 'french',
  volumes: Object.fromEntries(volumes.map((volume) => [volume.id, volume])),
  ...overrides,
});

const listBranchLevels = (series: PrintSeries) =>
  createTreeLayout(series).pieces.flatMap(({ growth }) =>
    growth.type === 'branch' ? [growth.level] : [],
  );

const findLimbTip = (series: PrintSeries, volumeId: string) => {
  const limb = createTreeLayout(series).pieces.filter(({ key }) =>
    key.startsWith(`${volumeId}-limb-`),
  );
  return limb[limb.length - 1].d.split(' ').slice(-2).map(Number);
};

describe('createTreeLayout', () => {
  describe('with several volumes', () => {
    const series = createSeries([
      createVolume(2, 400),
      createVolume(1, 200),
      createVolume(3, 200),
    ]);

    it('grows a branch for each volume, in volume order', () => {
      expect([...new Set(listBranchLevels(series))]).toEqual([0, 1, 2]);
    });

    it('grows the same tree every time', () => {
      expect(createTreeLayout(series)).toEqual(createTreeLayout(series));
    });

    it('centres the bounds on the trunk', () => {
      const { bounds } = createTreeLayout(series);

      expect(bounds.x).toBe(-bounds.width / 2);
    });

    describe('when another volume is added', () => {
      const grown = createSeries([
        ...Object.values(series.volumes!),
        createVolume(4, 300),
      ]);

      it('keeps the existing branches where they were', () => {
        const branchesOf = ({ pieces }: ReturnType<typeof createTreeLayout>) =>
          pieces.filter(({ growth }) => growth.type === 'branch');

        expect(branchesOf(createTreeLayout(grown))).toEqual(
          expect.arrayContaining(branchesOf(createTreeLayout(series))),
        );
      });
    });
  });

  describe('with a longer volume', () => {
    it('grows a longer branch', () => {
      const short = createSeries([createVolume(1, 100)]);
      const long = createSeries([createVolume(1, 900)]);
      const reach = (series: PrintSeries) =>
        Math.hypot(...findLimbTip(series, 'vol1'));

      expect(reach(long)).toBeGreaterThan(reach(short));
    });
  });

  describe('with a different series', () => {
    it('grows a different tree', () => {
      const volumes = [createVolume(1, 200), createVolume(2, 200)];

      expect(createTreeLayout(createSeries(volumes)).pieces).not.toEqual(
        createTreeLayout(createSeries(volumes, { id: 'verne' })).pieces,
      );
    });
  });

  describe.each(['book', 'manga'] as const)('for a %s series', (type) => {
    it('grows twigs off each limb', () => {
      const { pieces } = createTreeLayout(
        createSeries([createVolume(1, 200)], { type }),
      );

      expect(pieces.some(({ key }) => key.startsWith('vol1-twig-'))).toBe(true);
    });
  });

  describe('with no volumes', () => {
    it('grows just a trunk from the ground', () => {
      const { pieces } = createTreeLayout(createSeries([]));

      expect(pieces.map(({ growth }) => growth.type)).toEqual(['trunk']);
      expect(pieces[0].d).toMatch(/^M0 0 /);
    });
  });
});
