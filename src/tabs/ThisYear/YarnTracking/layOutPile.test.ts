import { layOutPile } from './layOutPile';
import { PileBall } from './pileBalls';

const createWoolBall = (id: number, grams: number): PileBall => ({
  ball: { id, yarnType: 'wool', grams },
});

describe('layOutPile', () => {
  describe('a ball', () => {
    it('is sized by how much of a full ball it holds', () => {
      const { balls } = layOutPile([createWoolBall(0, 100)], 400);

      expect(balls[0].size).toBe(24);
    });
  });

  describe('when the balls fit in one row', () => {
    it('centres the row across the width', () => {
      const { balls } = layOutPile(
        [createWoolBall(0, 200), createWoolBall(1, 200)],
        400,
      );

      expect(balls.map(({ x }) => x)).toEqual([176, 224]);
    });

    it('sits every ball on the bottom of the row', () => {
      const { balls, height } = layOutPile(
        [createWoolBall(0, 200), createWoolBall(1, 100)],
        400,
      );

      expect(balls.map(({ y, size }) => y + size / 2)).toEqual([48, 48]);
      expect(height).toBe(48);
    });
  });

  describe('when the balls are wider than the width', () => {
    it('wraps the rest onto a row below the tallest ball above', () => {
      const { balls, height } = layOutPile(
        [
          createWoolBall(0, 100),
          createWoolBall(1, 200),
          createWoolBall(2, 200),
        ],
        80,
      );

      expect(balls.map(({ x, y }) => ({ x, y }))).toEqual([
        { x: 16, y: 36 },
        { x: 52, y: 24 },
        { x: 40, y: 72 },
      ]);
      expect(height).toBe(96);
    });
  });
});
