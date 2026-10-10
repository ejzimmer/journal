import { placeBeetles } from './placeBeetles';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { PrintSeries, Volume } from './types';

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

const createSeries = (
  questions: Pick<Volume, 'lookups' | 'aiQuestions'>,
): PrintSeries => ({
  id: 'series',
  type: 'book',
  name: 'Series',
  language: 'french',
  volumes: { vol1: { id: 'vol1', number: 1, pages: 200, ...questions } },
});

describe('placeBeetles', () => {
  describe('for a volume with look-ups and AI questions', () => {
    const beetles = placeBeetles(
      createSeries({ lookups: 25, aiQuestions: 8 }),
      [createBranch('vol1-limb', 1)],
    );

    it('puts a red beetle on for every ten look-ups and a yellow one for every ten AI questions, alternating', () => {
      expect(beetles.map(({ colour }) => colour)).toEqual([
        'red',
        'yellow',
        'red',
        'red',
      ]);
    });

    it('spreads the beetles evenly along the branch', () => {
      expect(beetles.map(({ at }) => at)).toEqual([
        0.12 + 0.8 / 8,
        0.12 + (0.8 * 3) / 8,
        0.12 + (0.8 * 5) / 8,
        0.12 + (0.8 * 7) / 8,
      ]);
    });

    it('measures the length of the branch each beetle is on', () => {
      expect(beetles[0].length).toBe(100);
    });
  });

  describe('for a volume with several grown branches', () => {
    const beetles = placeBeetles(
      createSeries({ lookups: 30, aiQuestions: 0 }),
      [
        createBranch('vol1-limb', 1),
        createBranch('vol1-twig-0', 0.5),
        createBranch('vol1-twig-1', 0.1),
        createBranch('vol2-limb', 1),
      ],
    );

    it('shares the beetles between the volume’s branches that have grown far enough to hold one', () => {
      expect(beetles.map(({ edges }) => edges)).toEqual([
        createBranch('vol1-limb', 1).edges,
        createBranch('vol1-twig-0', 0.5).edges,
        createBranch('vol1-limb', 1).edges,
      ]);
    });

    it('keeps each beetle off the ungrown end of its branch', () => {
      expect(beetles[1].range).toEqual([0.12, 0.42]);
    });
  });
});
