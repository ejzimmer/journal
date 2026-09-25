import { BowlWorld, PlacedBall } from './bowlWorld';
import { PileBall } from './pileBalls';

const createWoolBall = (id: number, grams: number): PileBall => ({
  ball: { id, yarnType: 'wool', grams },
});

const getRadius = ({ size }: PlacedBall) => size * 0.4;

const getBowlHalfWidthAt = (world: BowlWorld, y: number) =>
  world.baseHalfWidth +
  (world.halfWidth - world.baseHalfWidth) *
    Math.sqrt(1 - (y / world.depth) ** 2);

const isInsideBowl = (world: BowlWorld, ball: PlacedBall) =>
  ball.y > 0 &&
  ball.y <= world.depth &&
  Math.abs(ball.x) <= getBowlHalfWidthAt(world, ball.y);

const getGap = (one: PlacedBall, other: PlacedBall) =>
  Math.hypot(one.x - other.x, one.y - other.y) -
  getRadius(one) -
  getRadius(other);

describe('BowlWorld', () => {
  describe('when balls are added', () => {
    it('settles them inside the bowl', () => {
      const pile = [createWoolBall(0, 200), createWoolBall(1, 100)];
      const world = new BowlWorld(pile);

      world.syncBalls(pile);

      const balls = world.getBalls();
      expect(balls.map(({ ball }) => ball.id)).toEqual([0, 1]);
      balls.forEach((ball) => expect(isInsideBowl(world, ball)).toBe(true));
    });

    it('sizes each ball by how much of a full ball it holds', () => {
      const pile = [createWoolBall(0, 100)];
      const world = new BowlWorld(pile);

      world.syncBalls(pile);

      expect(world.getBalls()[0].size).toBe(0.5);
    });

    it('keeps the balls from overlapping', () => {
      const pile = Array.from({ length: 12 }, (_, id) =>
        createWoolBall(id, 200),
      );
      const world = new BowlWorld(pile);

      world.syncBalls(pile);

      const balls = world.getBalls();
      balls.forEach((ball, index) =>
        balls
          .slice(index + 1)
          .forEach((other) =>
            expect(getGap(ball, other)).toBeGreaterThan(-0.02),
          ),
      );
    });

    describe('to a bowl that already has balls in it', () => {
      it('settles the new ones in with the rest', () => {
        const world = new BowlWorld([
          createWoolBall(0, 200),
          createWoolBall(1, 200),
        ]);
        world.syncBalls([createWoolBall(0, 200)]);

        world.syncBalls([createWoolBall(0, 200), createWoolBall(1, 200)]);

        const [first, second] = world.getBalls();
        expect(isInsideBowl(world, second)).toBe(true);
        expect(getGap(first, second)).toBeGreaterThan(-0.02);
      });
    });
  });

  describe('when a ball grows', () => {
    it('pushes its neighbours out of the way', () => {
      const pile = [createWoolBall(0, 50), createWoolBall(1, 200)];
      const world = new BowlWorld(pile);
      world.syncBalls(pile);

      world.syncBalls([createWoolBall(0, 200), createWoolBall(1, 200)]);

      const [grown, neighbour] = world.getBalls();
      expect(grown.size).toBe(1);
      expect(getGap(grown, neighbour)).toBeGreaterThan(-0.02);
    });
  });

  describe('when a ball leaves the pile', () => {
    it('takes it out of the bowl', () => {
      const world = new BowlWorld([
        createWoolBall(0, 200),
        createWoolBall(1, 200),
      ]);
      world.syncBalls([createWoolBall(0, 200), createWoolBall(1, 200)]);

      world.syncBalls([createWoolBall(1, 200)]);

      expect(world.getBalls().map(({ ball }) => ball.id)).toEqual([1]);
    });
  });

  describe('the size of the bowl', () => {
    it('grows with how much yarn it starts with', () => {
      const small = new BowlWorld(
        Array.from({ length: 10 }, (_, id) => createWoolBall(id, 200)),
      );
      const large = new BowlWorld(
        Array.from({ length: 40 }, (_, id) => createWoolBall(id, 200)),
      );

      expect(large.halfWidth).toBeGreaterThan(small.halfWidth);
    });
  });
});
