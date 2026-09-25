import { BowlWorld, PlacedBall } from './bowlWorld';
import { PileBall } from './pileBalls';

const createWoolBall = (id: number, grams: number): PileBall => ({
  ball: { id, yarnType: 'wool', grams },
});

const getRadius = ({ size }: PlacedBall) => size * 0.4;

const getBowlRadiusAt = (world: BowlWorld, y: number) =>
  world.baseRadius +
  (world.radius - world.baseRadius) * Math.sqrt(1 - (y / world.depth) ** 2);

const isInsideBowl = (world: BowlWorld, ball: PlacedBall) =>
  ball.y > 0 &&
  ball.y <= world.depth &&
  Math.abs(ball.x) <= getBowlRadiusAt(world, ball.y);

const getGap = (one: PlacedBall, other: PlacedBall) =>
  Math.hypot(one.x - other.x, one.y - other.y) -
  getRadius(one) -
  getRadius(other);

const findOverlappingPair = (balls: PlacedBall[]) =>
  balls
    .flatMap((ball, index) =>
      balls.slice(index + 1).map((other) => [ball, other]),
    )
    .find(([ball, other]) => getGap(ball, other) < -0.02);

const describeBall = ({ ball, x, y }: PlacedBall) =>
  `ball ${ball.id} at (${x.toFixed(2)}, ${y.toFixed(2)})`;

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheBowl(world: BowlWorld): R;
      toBeOverlapping(): R;
    }
  }
}

expect.extend({
  toBeInTheBowl(ball: PlacedBall, world: BowlWorld) {
    return {
      pass: isInsideBowl(world, ball),
      message: () =>
        `expected ${describeBall(ball)} ${this.isNot ? 'not ' : ''}to be in the bowl`,
    };
  },
  toBeOverlapping(balls: PlacedBall[]) {
    const pair = findOverlappingPair(balls);
    return {
      pass: pair !== undefined,
      message: () =>
        pair
          ? `expected ${pair.map(describeBall).join(' and ')} not to overlap`
          : 'expected some of the balls to overlap',
    };
  },
});

describe('BowlWorld', () => {
  describe('when balls are added', () => {
    it('settles them inside the bowl', () => {
      const pile = [createWoolBall(0, 200), createWoolBall(1, 100)];
      const world = new BowlWorld(pile);

      world.syncBalls(pile);

      const balls = world.getBalls();
      expect(balls.map(({ ball }) => ball.id)).toEqual([0, 1]);
      balls.forEach((ball) => expect(ball).toBeInTheBowl(world));
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

      expect(world.getBalls()).not.toBeOverlapping();
    });

    describe('to a bowl that already has balls in it', () => {
      it('settles the new ones in with the rest', () => {
        const world = new BowlWorld([
          createWoolBall(0, 200),
          createWoolBall(1, 200),
        ]);
        world.syncBalls([createWoolBall(0, 200)]);

        world.syncBalls([createWoolBall(0, 200), createWoolBall(1, 200)]);

        const balls = world.getBalls();
        expect(balls[1]).toBeInTheBowl(world);
        expect(balls).not.toBeOverlapping();
      });
    });
  });

  describe('when a ball grows', () => {
    it('pushes its neighbours out of the way', () => {
      const pile = [createWoolBall(0, 50), createWoolBall(1, 200)];
      const world = new BowlWorld(pile);
      world.syncBalls(pile);

      world.syncBalls([createWoolBall(0, 200), createWoolBall(1, 200)]);

      const balls = world.getBalls();
      expect(balls[0].size).toBe(1);
      expect(balls).not.toBeOverlapping();
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

      expect(large.radius).toBeGreaterThan(small.radius);
    });
  });
});
