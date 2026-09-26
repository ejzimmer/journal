import { Body, Chain, Circle, World } from 'planck';
import { PileBall } from './pileBalls';
import { YarnBall } from './types';
import { GRAMS_PER_BALL } from './utils';
import {
  Tween,
  advanceTween,
  createTween,
  finishTween,
  getTweenValue,
  isTweenRunning,
  retargetTween,
} from './tween';

export type PlacedBall = PileBall & {
  x: number;
  y: number;
  size: number;
  angle: number;
  greyness: number;
};

type BallBody = {
  body: Body;
  size: Tween;
  greyness: Tween;
  fixtureSize: number;
};

const GRAVITY = 10;
const TIME_STEP = 1 / 60;
const MAX_SETTLE_STEPS = 1200;
const MAX_FRAME_TIME = 0.1;
const DROP_CLEARANCE = 1.5;
const RESIZE_DURATION = 0.5;
const GREYING_DURATION = 0.8;
const BALL_RADIUS_TO_SIZE = 0.4;
const BOWL_DEPTH_TO_RADIUS = 1;
const BOWL_BASE_TO_RADIUS = 0.25;
const BALL_AREA_TO_BOWL_AREA = 0.8;
const MIN_BOWL_RADIUS = 1.5;
const BOWL_SEGMENTS = 48;
const BALL_BODY = { density: 1, friction: 0.4, restitution: 0.1 };
const BALL_DAMPING = { linearDamping: 0.5, angularDamping: 2 };
const BOWL_FRICTION = 0.6;

const getBallSize = ({ grams }: YarnBall) => grams / GRAMS_PER_BALL;

const getGreyness = ({ fade }: PileBall) => (fade === undefined ? 0 : 1);

const getBallRadius = (size: number) => size * BALL_RADIUS_TO_SIZE;

function calculateBowlRadius(pileBalls: PileBall[]) {
  const ballArea = pileBalls.reduce(
    (total, { ball }) =>
      total + Math.PI * getBallRadius(getBallSize(ball)) ** 2,
    0,
  );
  const bowlArea = ballArea / BALL_AREA_TO_BOWL_AREA;
  const areaToRadiusSquared =
    BOWL_DEPTH_TO_RADIUS *
    (2 * BOWL_BASE_TO_RADIUS + (Math.PI / 2) * (1 - BOWL_BASE_TO_RADIUS));
  const radius = Math.sqrt(bowlArea / areaToRadiusSquared);

  return Math.max(radius, MIN_BOWL_RADIUS);
}

function getBowlSidePoints(radius: number, baseRadius: number, depth: number) {
  return Array.from({ length: BOWL_SEGMENTS / 2 + 1 }, (_, index) => {
    const turn = (Math.PI * index) / BOWL_SEGMENTS;
    return {
      x: baseRadius + (radius - baseRadius) * Math.cos(turn),
      y: depth * Math.sin(turn),
    };
  });
}

function getBowlPoints(radius: number, baseRadius: number, depth: number) {
  const side = getBowlSidePoints(radius, baseRadius, depth);
  return [...side.map(({ x, y }) => ({ x: -x, y })), ...side.reverse()];
}

const getSpreadForBall = (id: number) => ((id * 0.618) % 1) - 0.5;

export class BowlWorld {
  readonly radius: number;
  readonly baseRadius: number;
  readonly depth: number;
  private world = new World({ gravity: { x: 0, y: GRAVITY } });
  private ballBodies = new Map<number, BallBody>();
  private pileBalls: PileBall[] = [];
  private unsimulatedTime = 0;

  constructor(pileBalls: PileBall[]) {
    this.radius = calculateBowlRadius(pileBalls);
    this.baseRadius = this.radius * BOWL_BASE_TO_RADIUS;
    this.depth = this.radius * BOWL_DEPTH_TO_RADIUS;
    this.world
      .createBody()
      .createFixture(
        new Chain(getBowlPoints(this.radius, this.baseRadius, this.depth)),
        { friction: BOWL_FRICTION },
      );
    this.syncBalls(pileBalls);
    this.settle();
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
    newBalls.forEach((pileBall, index) =>
      this.addBall(pileBall, firstSlot + index, dropHeight),
    );

    pileBalls.forEach((pileBall) => this.retargetBall(pileBall));

    this.pileBalls = pileBalls;
  }

  advance(seconds: number) {
    this.unsimulatedTime += Math.min(seconds, MAX_FRAME_TIME);
    while (this.unsimulatedTime >= TIME_STEP) {
      this.stepWorld();
      this.unsimulatedTime -= TIME_STEP;
    }
  }

  settle() {
    this.ballBodies.forEach((ballBody) => {
      ballBody.size = finishTween(ballBody.size);
      ballBody.greyness = finishTween(ballBody.greyness);
      this.applyBallSize(ballBody);
    });
    for (let step = 0; step < MAX_SETTLE_STEPS && !this.isAtRest(); step++) {
      this.stepWorld();
    }
  }

  isAtRest() {
    return [...this.ballBodies.values()].every(
      ({ body, size, greyness }) =>
        !body.isAwake() && !isTweenRunning(size) && !isTweenRunning(greyness),
    );
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
          size: ballBody.fixtureSize,
          angle: ballBody.body.getAngle(),
          greyness: getTweenValue(ballBody.greyness),
        },
      ];
    });
  }

  getTopOfPile() {
    return [...this.ballBodies.values()].reduce(
      (top, { body, fixtureSize }) =>
        Math.min(top, body.getPosition().y - getBallRadius(fixtureSize)),
      0,
    );
  }

  private getColumns() {
    return Math.max(1, Math.floor(2 * this.radius) - 1);
  }

  private addBall(pileBall: PileBall, slot: number, dropHeight: number) {
    const { ball } = pileBall;
    const columns = this.getColumns();
    const row = Math.floor(slot / columns);
    const column = slot % columns;
    const x =
      -this.radius +
      1 +
      column +
      (row % 2) * 0.5 +
      getSpreadForBall(ball.id) * 0.2;
    const y = dropHeight - DROP_CLEARANCE - row;

    const body = this.world.createDynamicBody({
      position: { x, y },
      ...BALL_DAMPING,
    });
    const ballBody = {
      body,
      size: createTween(getBallSize(ball), RESIZE_DURATION),
      greyness: createTween(getGreyness(pileBall), GREYING_DURATION),
      fixtureSize: 0,
    };
    this.ballBodies.set(ball.id, ballBody);
    this.applyBallSize(ballBody);
  }

  private retargetBall(pileBall: PileBall) {
    const ballBody = this.ballBodies.get(pileBall.ball.id);
    if (!ballBody) return;

    ballBody.size = retargetTween(ballBody.size, getBallSize(pileBall.ball));
    ballBody.greyness = retargetTween(ballBody.greyness, getGreyness(pileBall));
  }

  private stepWorld() {
    this.ballBodies.forEach((ballBody) => {
      ballBody.size = advanceTween(ballBody.size, TIME_STEP);
      ballBody.greyness = advanceTween(ballBody.greyness, TIME_STEP);
      this.applyBallSize(ballBody);
    });
    this.world.step(TIME_STEP);
  }

  private applyBallSize(ballBody: BallBody) {
    const size = getTweenValue(ballBody.size);
    if (size === ballBody.fixtureSize) return;

    const fixture = ballBody.body.getFixtureList();
    if (fixture) ballBody.body.destroyFixture(fixture);
    ballBody.body.createFixture(new Circle(getBallRadius(size)), BALL_BODY);
    ballBody.body.setAwake(true);
    ballBody.fixtureSize = size;
  }
}
