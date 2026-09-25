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

const createWoolBalls = (count: number) =>
  Array.from({ length: count }, (_, id) => createWoolBall(id, 200));

const getAverageHeight = (balls: PlacedBall[]) =>
  balls.reduce((total, { y }) => total + y, 0) / balls.length;

describe('BowlWorld', () => {
  describe('when it is created', () => {
    it('settles its balls inside the bowl', () => {
      const world = new BowlWorld([
        createWoolBall(0, 200),
        createWoolBall(1, 100),
      ]);

      const balls = world.getBalls();
      expect(balls.map(({ ball }) => ball.id)).toEqual([0, 1]);
      balls.forEach((ball) => expect(ball).toBeInTheBowl(world));
      expect(world.isAtRest()).toBe(true);
    });

    it('sizes each ball by how much of a full ball it holds', () => {
      const world = new BowlWorld([createWoolBall(0, 100)]);

      expect(world.getBalls()[0].size).toBe(0.5);
    });

    it('keeps the balls from overlapping', () => {
      const world = new BowlWorld(createWoolBalls(12));

      expect(world.getBalls()).not.toBeOverlapping();
    });
  });

  describe('when balls are added', () => {
    const addBall = () => {
      const world = new BowlWorld(createWoolBalls(6));
      const topOfPile = world.getTopOfPile();
      world.syncBalls([...createWoolBalls(6), createWoolBall(6, 50)]);
      return { world, topOfPile };
    };

    it('drops the new ones in from above the pile', () => {
      const { world, topOfPile } = addBall();

      expect(world.getBalls()[6].y).toBeLessThan(topOfPile);
      expect(world.isAtRest()).toBe(false);
    });

    it('moves them down as time passes', () => {
      const { world } = addBall();
      const startHeight = world.getBalls()[6].y;

      world.advance(0.1);

      expect(world.getBalls()[6].y).toBeGreaterThan(startHeight);
    });

    describe('once they have settled', () => {
      it('lands them in the bowl with the rest', () => {
        const { world } = addBall();

        world.settle();

        const balls = world.getBalls();
        expect(balls[6]).toBeInTheBowl(world);
        expect(balls).not.toBeOverlapping();
        expect(world.isAtRest()).toBe(true);
      });
    });
  });

  describe('when a ball grows', () => {
    it('pushes its neighbours out of the way', () => {
      const world = new BowlWorld([
        createWoolBall(0, 50),
        createWoolBall(1, 200),
      ]);

      world.syncBalls([createWoolBall(0, 200), createWoolBall(1, 200)]);
      world.settle();

      const balls = world.getBalls();
      expect(balls[0].size).toBe(1);
      expect(balls).not.toBeOverlapping();
    });
  });

  describe('when a ball leaves the pile', () => {
    const removeLowestBall = () => {
      const world = new BowlWorld(createWoolBalls(8));
      const lowestBall = world
        .getBalls()
        .reduce((lowest, ball) => (ball.y > lowest.y ? ball : lowest));
      const remainingBalls = createWoolBalls(8).filter(
        ({ ball }) => ball.id !== lowestBall.ball.id,
      );
      world.syncBalls(remainingBalls);
      return { world, removedId: lowestBall.ball.id };
    };

    it('takes it out of the bowl', () => {
      const { world, removedId } = removeLowestBall();

      expect(world.getBalls().map(({ ball }) => ball.id)).not.toContain(
        removedId,
      );
      expect(world.getBalls()).toHaveLength(7);
    });

    it('lets the rest fall into the gap', () => {
      const { world } = removeLowestBall();
      const heightBefore = getAverageHeight(world.getBalls());

      world.settle();

      expect(getAverageHeight(world.getBalls())).toBeGreaterThan(
        heightBefore + 0.05,
      );
    });
  });

  describe('the size of the bowl', () => {
    it('grows with how much yarn it starts with', () => {
      const small = new BowlWorld(createWoolBalls(10));
      const large = new BowlWorld(createWoolBalls(40));

      expect(large.radius).toBeGreaterThan(small.radius);
    });
  });
});
