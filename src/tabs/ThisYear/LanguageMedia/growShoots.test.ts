import { growShoots } from './growShoots';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { ShootStyle } from './treeSpecies';

const style: ShootStyle = {
  spacing: 20,
  length: [10, 10],
  splay: 45,
  bendToward: 90,
  bend: 0,
  widths: [2, 1],
  leafGap: 4,
  leafSplay: 30,
  tuft: [0],
};

const createBranch = (key: string, amount: number): GrownShape => ({
  key,
  amount,
  growth: { type: 'branch', level: 0, start: 0, end: 1 },
  edges: Array.from({ length: 11 }, (_, index): EdgeSample => ({
    at: index / 10,
    left: { x: index * 10, y: 2 },
    right: { x: index * 10, y: -2 },
  })),
});

const findBase = ({ edges }: { edges: EdgeSample[] }) => ({
  x: (edges[0].left.x + edges[0].right.x) / 2,
  y: (edges[0].left.y + edges[0].right.y) / 2,
});

describe('growShoots', () => {
  describe('on a fully grown twig', () => {
    const shoots = growShoots(createBranch('vol1-twig-0', 1), style);

    it('spaces shoots evenly along the twig', () => {
      expect(shoots.map((shoot) => Math.round(findBase(shoot).x))).toEqual([
        10, 30, 50, 70, 90,
      ]);
    });

    it('alternates the side each shoot grows from', () => {
      const sides = shoots.map((shoot) => Math.sign(findBase(shoot).y));

      sides.slice(1).forEach((side, index) => {
        expect(side).toBe(-sides[index]);
      });
    });

    it('puts leaves along each shoot and a tuft at its tip', () => {
      expect(shoots[0].leaves).toHaveLength(3);
    });
  });

  describe('on a half grown branch', () => {
    it('only grows shoots on the read half', () => {
      const shoots = growShoots(createBranch('vol1-twig-0', 0.5), style);

      expect(shoots.map((shoot) => Math.round(findBase(shoot).x))).toEqual([
        10, 30,
      ]);
    });
  });

  describe('on a limb', () => {
    it('keeps the shoots back from the tip', () => {
      const shoots = growShoots(createBranch('vol1-limb', 0.9), style);

      expect(shoots.map((shoot) => Math.round(findBase(shoot).x))).toEqual([
        10, 30, 50, 70,
      ]);
    });
  });

  describe('when the branch grows further', () => {
    it('keeps the shoots it already had', () => {
      const shorter = growShoots(createBranch('vol1-twig-0', 0.5), style);
      const longer = growShoots(createBranch('vol1-twig-0', 1), style);

      expect(longer).toEqual(expect.arrayContaining(shorter));
    });
  });
});
