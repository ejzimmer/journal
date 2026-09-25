import { Body, Chain, Circle, World } from 'planck';
import { PileBall } from './pileBalls';
import { YarnBall } from './types';
import { GRAMS_PER_BALL } from './utils';

export type PlacedBall = PileBall & {
  x: number;
  y: number;
  size: number;
  angle: number;
};

type BallBody = { body: Body; size: number };

const GRAVITY = 10;
const TIME_STEP = 1 / 60;
const MAX_SETTLE_STEPS = 1200;
const BALL_RADIUS_TO_SIZE = 0.4;
const BOWL_DEPTH_TO_HALF_WIDTH = 0.6;
const BALL_AREA_TO_BOWL_AREA = 0.5;
const MIN_BOWL_HALF_WIDTH = 1.5;
const BOWL_SEGMENTS = 48;
const BALL_BODY = { density: 1, friction: 0.4, restitution: 0.1 };
const BOWL_FRICTION = 0.6;

const getBallSize = ({ grams }: YarnBall) => grams / GRAMS_PER_BALL;

const getBallRadius = (size: number) => size * BALL_RADIUS_TO_SIZE;

function getBowlHalfWidth(pileBalls: PileBall[]) {
  const ballArea = pileBalls.reduce(
    (total, { ball }) =>
      total + Math.PI * getBallRadius(getBallSize(ball)) ** 2,
    0,
  );
  const bowlArea = ballArea / BALL_AREA_TO_BOWL_AREA;
  const halfWidth = Math.sqrt(
    (2 * bowlArea) / (Math.PI * BOWL_DEPTH_TO_HALF_WIDTH),
  );

  return Math.max(halfWidth, MIN_BOWL_HALF_WIDTH);
}

function getBowlPoints(halfWidth: number, depth: number) {
  return Array.from({ length: BOWL_SEGMENTS + 1 }, (_, index) => {
    const turn = (Math.PI * index) / BOWL_SEGMENTS;
    return { x: -halfWidth * Math.cos(turn), y: depth * Math.sin(turn) };
  });
}

const getSpreadForBall = (id: number) => ((id * 0.618) % 1) - 0.5;

export class BowlWorld {
  readonly halfWidth: number;
  readonly depth: number;
  private world = new World({ gravity: { x: 0, y: GRAVITY } });
  private ballBodies = new Map<number, BallBody>();
  private pileBalls: PileBall[] = [];

  constructor(pileBalls: PileBall[]) {
    this.halfWidth = getBowlHalfWidth(pileBalls);
    this.depth = this.halfWidth * BOWL_DEPTH_TO_HALF_WIDTH;
    this.world
      .createBody()
      .createFixture(new Chain(getBowlPoints(this.halfWidth, this.depth)), {
        friction: BOWL_FRICTION,
      });
  }

  syncBalls(pileBalls: PileBall[]) {
    const ids = new Set(pileBalls.map(({ ball }) => ball.id));
    this.ballBodies.forEach(({ body }, id) => {
      if (!ids.has(id)) {
        this.world.destroyBody(body);
        this.ballBodies.delete(id);
      }
    });

    const newBalls = pileBalls.filter(
      ({ ball }) => !this.ballBodies.has(ball.id),
    );
    const dropHeight = this.getTopOfPile();
    const firstSlot = Math.floor(
      (getSpreadForBall(newBalls[0]?.ball.id ?? 0) + 0.5) * this.getColumns(),
    );
    newBalls.forEach(({ ball }, index) =>
      this.addBall(ball, firstSlot + index, dropHeight),
    );

    pileBalls.forEach(({ ball }) => this.resizeBall(ball));

    this.pileBalls = pileBalls;
    this.settle();
  }

  getBalls(): PlacedBall[] {
    return this.pileBalls.flatMap((pileBall) => {
      const ballBody = this.ballBodies.get(pileBall.ball.id);
      if (!ballBody) return [];

      const { x, y } = ballBody.body.getPosition();
      return [
        {
          ...pileBall,
          x,
          y,
          size: ballBody.size,
          angle: ballBody.body.getAngle(),
        },
      ];
    });
  }

  getTopOfPile() {
    return [...this.ballBodies.values()].reduce(
      (top, { body, size }) =>
        Math.min(top, body.getPosition().y - getBallRadius(size)),
      0,
    );
  }

  private getColumns() {
    return Math.max(1, Math.floor(2 * this.halfWidth) - 1);
  }

  private addBall(ball: YarnBall, slot: number, dropHeight: number) {
    const columns = this.getColumns();
    const row = Math.floor(slot / columns);
    const column = slot % columns;
    const x =
      -this.halfWidth +
      1 +
      column +
      (row % 2) * 0.5 +
      getSpreadForBall(ball.id) * 0.2;
    const y = dropHeight - 0.5 - row;

    const body = this.world.createDynamicBody({ position: { x, y } });
    this.ballBodies.set(ball.id, { body, size: 0 });
  }

  private resizeBall(ball: YarnBall) {
    const ballBody = this.ballBodies.get(ball.id);
    const size = getBallSize(ball);
    if (!ballBody || ballBody.size === size) return;

    const fixture = ballBody.body.getFixtureList();
    if (fixture) ballBody.body.destroyFixture(fixture);
    ballBody.body.createFixture(new Circle(getBallRadius(size)), BALL_BODY);
    ballBody.body.setAwake(true);
    ballBody.size = size;
  }

  private settle() {
    for (let step = 0; step < MAX_SETTLE_STEPS && this.isMoving(); step++) {
      this.world.step(TIME_STEP);
    }
  }

  private isMoving() {
    return [...this.ballBodies.values()].some(({ body }) => body.isAwake());
  }
}
