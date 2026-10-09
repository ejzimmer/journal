import { createCloudShape } from './createCloudShape';

const width = 480;
const height = 260;

const listLeftEdges = () =>
  createCloudShape(width, height)
    .puffs.filter(([cx]) => cx < width / 2)
    .filter(([, cy]) => cy >= 100)
    .map(([cx, cy, radius]) => ({ y: cy, edge: cx - radius }));

describe('createCloudShape', () => {
  describe('the bottom', () => {
    it('lies flat along the bottom of the box', () => {
      const { hull } = createCloudShape(width, height);
      const bottom = hull.filter(([, y]) => y === height);

      expect(bottom).toHaveLength(2);
    });

    it('has no puffs hanging below the box', () => {
      const { puffs } = createCloudShape(width, height);
      const lowest = Math.max(...puffs.map(([, cy, radius]) => cy + radius));

      expect(lowest).toBe(height);
    });
  });

  describe('the sides', () => {
    it('get wider towards the bottom', () => {
      const edges = listLeftEdges().sort((a, b) => a.y - b.y);

      edges.slice(1).forEach(({ edge }, index) => {
        expect(edge).toBeLessThan(edges[index].edge);
      });
    });

    it('overhang the box at the bottom', () => {
      const edges = listLeftEdges();
      const lowest = edges.reduce((a, b) => (b.y > a.y ? b : a));

      expect(lowest.edge).toBeLessThan(0);
    });

    it('mirror each other', () => {
      const { puffs } = createCloudShape(width, height);
      const sidePuffs = puffs.filter(([, cy]) => cy >= 100);
      const left = sidePuffs.filter(([cx]) => cx < width / 2);
      const right = sidePuffs.filter(([cx]) => cx > width / 2);

      expect(right.map(([cx, cy, r]) => [width - cx, cy, r])).toEqual(left);
    });
  });

  describe('when the box is taller', () => {
    it('adds more puffs down the sides', () => {
      const short = createCloudShape(width, 260).puffs.length;
      const tall = createCloudShape(width, 500).puffs.length;

      expect(tall).toBeGreaterThan(short);
    });
  });
});
