import { createTreeLayout } from './treeLayout';
import { Volume } from './types';

const createVolume = (number: number, pages?: number): Volume => ({
  id: `vol${number}`,
  number,
  pages,
  lookups: 0,
  aiQuestions: 0,
});

const readEnd = (d: string) => d.split(' ').slice(-2).map(Number);

describe('createTreeLayout', () => {
  describe('with several volumes', () => {
    const volumes = {
      vol2: createVolume(2, 400),
      vol1: createVolume(1, 200),
      vol3: createVolume(3, 200),
    };

    it('gives each volume a level, in volume order', () => {
      const { levels } = createTreeLayout(volumes);

      expect(levels.map(({ volume }) => volume.number)).toEqual([1, 2, 3]);
    });

    it('alternates the branches left and right, starting on the left', () => {
      const { levels } = createTreeLayout(volumes);

      expect(
        levels.map(({ branch }) => Math.sign(readEnd(branch.d)[0])),
      ).toEqual([-1, 1, -1]);
    });

    it('stacks each level above the one before', () => {
      const { levels } = createTreeLayout(volumes);
      const heights = levels.map(({ stem }) => readEnd(stem.d)[1]);

      expect(heights[1]).toBeLessThan(heights[0]);
      expect(heights[2]).toBeLessThan(heights[1]);
    });

    it('gives longer volumes longer branches', () => {
      const { levels } = createTreeLayout(volumes);
      const [first, second] = levels.map(({ branch }) =>
        Math.abs(readEnd(branch.d)[0]),
      );

      expect(second).toBeGreaterThan(first);
    });

    it('puts the crown on top of the last level', () => {
      const { levels, crown } = createTreeLayout(volumes);

      expect(crown.d).toMatch(
        new RegExp(`^M${readEnd(levels[2].stem.d).join(' ')} `),
      );
    });

    it('centres the bounds on the trunk', () => {
      const { bounds } = createTreeLayout(volumes);

      expect(bounds.x).toBe(-bounds.width / 2);
    });
  });

  describe('with no volumes', () => {
    it('grows just the crown from the ground', () => {
      const { levels, crown } = createTreeLayout();

      expect(levels).toEqual([]);
      expect(crown.d).toMatch(/^M0 0 /);
    });
  });
});
