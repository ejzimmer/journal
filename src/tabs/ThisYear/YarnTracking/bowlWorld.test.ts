import { BowlWorld, PlacedBall, createSettledBowlWorld } from './bowlWorld';
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

const useBall = (pileBall: PileBall): PileBall => ({ ...pileBall, fade: 0 });

const splitByUse = (balls: PlacedBall[]) => ({
  used: balls.filter(({ fade }) => fade !== undefined),
  unused: balls.filter(({ fade }) => fade === undefined),
});

const advanceFor = (world: BowlWorld, seconds: number) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 0.1) {
    world.advance(0.1);
  }
};

describe('BowlWorld', () => {
  describe('when it is created', () => {
    it('settles its balls inside the bowl', () => {
      const world = createSettledBowlWorld([
        createWoolBall(0, 200),
        createWoolBall(1, 100),
      ]);

      const balls = world.getBalls();
      expect(balls.map(({ ball }) => ball.id)).toEqual([0, 1]);
      balls.forEach((ball) => expect(ball).toBeInTheBowl(world));
      expect(world.isAtRest()).toBe(true);
    });

    it('sizes each ball by how much of a full ball it holds', () => {
      const world = createSettledBowlWorld([createWoolBall(0, 100)]);

      expect(world.getBalls()[0].size).toBe(0.5);
    });

    describe('with balls that were already used', () => {
      it('starts them out grey', () => {
        const world = createSettledBowlWorld([
          createWoolBall(0, 200),
          { ...createWoolBall(1, 200), fade: 0.5 },
        ]);

        expect(world.getBalls().map(({ greyness }) => greyness)).toEqual([
          0, 1,
        ]);
      });
    });

    it('keeps the balls from overlapping', () => {
      const world = createSettledBowlWorld(createWoolBalls(12));

      expect(world.getBalls()).not.toBeOverlapping();
    });
  });

  describe('when balls are added', () => {
    const addBall = () => {
      const world = createSettledBowlWorld(createWoolBalls(6));
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

  describe('when more balls are added than the bowl holds', () => {
    const overfillBowl = () => {
      const world = createSettledBowlWorld(createWoolBalls(20));
      world.syncBalls(createWoolBalls(40));
      world.settle();
      return world;
    };

    it('spills the extra onto the table beside the bowl', () => {
      const world = overfillBowl();

      const spilled = world
        .getBalls()
        .filter(({ x }) => Math.abs(x) > world.radius);
      expect(spilled.length).toBeGreaterThan(0);
      spilled.forEach((ball) => {
        expect(Math.abs(ball.x)).toBeLessThan(world.tableHalfWidth);
        expect(ball.y).toBeLessThan(world.depth);
      });
    });

    it('lets every ball come to rest', () => {
      const world = overfillBowl();

      expect(world.isAtRest()).toBe(true);
    });
  });

  describe('when a ball grows', () => {
    it('grows it gradually', () => {
      const world = createSettledBowlWorld([createWoolBall(0, 100)]);

      world.syncBalls([createWoolBall(0, 200)]);
      world.advance(0.1);

      expect(world.getBalls()[0].size).toBeGreaterThan(0.5);
      expect(world.getBalls()[0].size).toBeLessThan(1);
      expect(world.isAtRest()).toBe(false);
    });

    it('pushes its neighbours out of the way', () => {
      const world = createSettledBowlWorld([
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

  describe('when a ball shrinks', () => {
    const shrinkLowestBall = () => {
      const world = createSettledBowlWorld(createWoolBalls(8));
      const lowestBall = world
        .getBalls()
        .reduce((lowest, ball) => (ball.y > lowest.y ? ball : lowest));
      world.syncBalls(
        createWoolBalls(8).map(({ ball }) =>
          ball.id === lowestBall.ball.id
            ? createWoolBall(ball.id, 50)
            : { ball },
        ),
      );
      return { world, shrunkId: lowestBall.ball.id };
    };

    it('shrinks it gradually', () => {
      const { world, shrunkId } = shrinkLowestBall();

      world.advance(0.1);

      const shrunk = world.getBalls()[shrunkId];
      expect(shrunk.size).toBeGreaterThan(0.25);
      expect(shrunk.size).toBeLessThan(1);
    });

    it('lets the rest fill the space it leaves', () => {
      const { world, shrunkId } = shrinkLowestBall();
      const others = (balls: PlacedBall[]) =>
        balls.filter(({ ball }) => ball.id !== shrunkId);
      const heightBefore = getAverageHeight(others(world.getBalls()));

      world.settle();

      expect(world.getBalls()[shrunkId].size).toBe(0.25);
      expect(getAverageHeight(others(world.getBalls()))).toBeGreaterThan(
        heightBefore + 0.05,
      );
    });
  });

  describe('when a ball is used up', () => {
    it('greys it out gradually', () => {
      const world = createSettledBowlWorld([createWoolBall(0, 200)]);

      world.syncBalls([{ ...createWoolBall(0, 200), fade: 0 }]);
      world.advance(0.2);

      expect(world.getBalls()[0].greyness).toBeGreaterThan(0);
      expect(world.getBalls()[0].greyness).toBeLessThan(1);
      expect(world.isAtRest()).toBe(false);
    });

    it('ends up fully grey', () => {
      const world = createSettledBowlWorld([createWoolBall(0, 200)]);

      world.syncBalls([{ ...createWoolBall(0, 200), fade: 0 }]);
      world.settle();

      expect(world.getBalls()[0].greyness).toBe(1);
    });

    it('lifts it to the top of the pile', () => {
      const world = createSettledBowlWorld(createWoolBalls(8));
      const lowestBall = world
        .getBalls()
        .reduce((lowest, ball) => (ball.y > lowest.y ? ball : lowest));

      world.syncBalls(
        createWoolBalls(8).map((pileBall) =>
          pileBall.ball.id === lowestBall.ball.id
            ? useBall(pileBall)
            : pileBall,
        ),
      );
      world.settle();

      const { used, unused } = splitByUse(world.getBalls());
      expect(used[0].ball.id).toBe(lowestBall.ball.id);
      expect(used[0].y).toBeLessThan(getAverageHeight(unused));
    });
  });

  describe('when yarn is added while some has been used', () => {
    it('lifts the used balls above the new ones', () => {
      const usedBalls = createWoolBalls(3).map(useBall);
      const world = createSettledBowlWorld(usedBalls);
      const newBalls = [createWoolBall(3, 200), createWoolBall(4, 200)];

      world.syncBalls([...usedBalls, ...newBalls]);
      world.settle();

      const { used, unused } = splitByUse(world.getBalls());
      expect(getAverageHeight(used)).toBeLessThan(getAverageHeight(unused));
    });
  });

  describe('when a ball leaves the pile', () => {
    const removeLowestBall = () => {
      const world = createSettledBowlWorld(createWoolBalls(8));
      const lowestBall = world
        .getBalls()
        .reduce((lowest, ball) => (ball.y > lowest.y ? ball : lowest));
      const remainingBalls = createWoolBalls(8).filter(
        ({ ball }) => ball.id !== lowestBall.ball.id,
      );
      world.syncBalls(remainingBalls);
      return { world, removedId: lowestBall.ball.id };
    };

    it('shrinks it gradually', () => {
      const { world, removedId } = removeLowestBall();

      world.advance(0.1);

      const removed = world.getBalls()[removedId];
      expect(removed.size).toBeGreaterThan(0);
      expect(removed.size).toBeLessThan(1);
    });

    describe('once it has shrunk away', () => {
      it('takes it out of the bowl', () => {
        const { world, removedId } = removeLowestBall();
        const removed = world.getBalls()[removedId];

        world.settle();

        expect(world.getBalls()).not.toContainEqual(
          expect.objectContaining({ ball: removed.ball }),
        );
        expect(world.getBalls()).toHaveLength(7);
      });

      it('lets the rest fall into the gap', () => {
        const { world, removedId } = removeLowestBall();
        const others = (balls: PlacedBall[]) =>
          balls.filter(({ ball }) => ball.id !== removedId);
        const heightBefore = getAverageHeight(others(world.getBalls()));

        world.settle();

        expect(getAverageHeight(others(world.getBalls()))).toBeGreaterThan(
          heightBefore + 0.05,
        );
      });
    });
  });

  describe('when a year is replayed', () => {
    const replayWoolBalls = (piles: PileBall[][]) => {
      const world = new BowlWorld(createWoolBalls(16));
      world.replayPiles(piles);
      return world;
    };

    describe('the first pile', () => {
      it('pours in one ball at a time', () => {
        const world = replayWoolBalls([createWoolBalls(8)]);

        world.advance(0.05);
        expect(world.getBalls()).toHaveLength(1);

        world.advance(0.1);
        world.advance(0.1);
        expect(world.getBalls()).toHaveLength(2);
      });

      it('is not at rest while it is pouring', () => {
        const world = replayWoolBalls([createWoolBalls(8)]);

        expect(world.isAtRest()).toBe(false);
      });

      it('settles inside the bowl', () => {
        const world = replayWoolBalls([createWoolBalls(8)]);

        world.settle();

        const balls = world.getBalls();
        expect(balls).toHaveLength(8);
        balls.forEach((ball) => expect(ball).toBeInTheBowl(world));
        expect(balls).not.toBeOverlapping();
      });

      it('pours the used balls in after the unused ones', () => {
        const world = replayWoolBalls([
          [...createWoolBalls(3).map(useBall), createWoolBall(3, 200)],
        ]);

        world.advance(0.05);

        expect(world.getBalls()[0].ball.id).toBe(3);
      });
    });

    describe('the later piles', () => {
      const replayThreeMonths = () =>
        replayWoolBalls([
          createWoolBalls(4),
          createWoolBalls(5),
          createWoolBalls(6),
        ]);

      it('play out one after another once the pour is done', () => {
        const world = replayThreeMonths();

        advanceFor(world, 1.2);
        expect(world.getBalls()).toHaveLength(4);

        advanceFor(world, 0.5);
        expect(world.getBalls()).toHaveLength(5);

        advanceFor(world, 1);
        expect(world.getBalls()).toHaveLength(6);
      });
    });

    describe('when the pile changes during the replay', () => {
      it('plays the change after the rest of the year', () => {
        const world = replayWoolBalls([createWoolBalls(4), createWoolBalls(5)]);

        world.syncBalls(createWoolBalls(6));
        advanceFor(world, 1.7);
        expect(world.getBalls()).toHaveLength(5);

        world.settle();
        expect(world.getBalls()).toHaveLength(6);
      });
    });
  });

  describe('the size of the bowl', () => {
    it('grows with how much yarn it starts with', () => {
      const small = createSettledBowlWorld(createWoolBalls(10));
      const large = createSettledBowlWorld(createWoolBalls(40));

      expect(large.radius).toBeGreaterThan(small.radius);
    });
  });
});
