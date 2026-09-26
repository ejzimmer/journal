import { Body, Chain, Circle, Vec2Value, World } from 'planck';
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
  pileBall: PileBall;
  rising: boolean;
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
const TABLE_OVERHANG = 2.5;
const TABLE_WALL_HEIGHT = 50;
const POUR_INTERVAL = 0.12;
const PAUSE_BETWEEN_CHANGES = 1;
const POUR_X_TO_RADIUS = -0.3;
const POUR_HEIGHT = 1.5;
const POUR_VELOCITY = { x: 1, y: 8 };
const POUR_SPIN = 6;

const getBallSize = ({ grams }: YarnBall) => grams / GRAMS_PER_BALL;

const isUsed = ({ fade }: PileBall) => fade !== undefined;

const getGreyness = (pileBall: PileBall) => (isUsed(pileBall) ? 1 : 0);

const sortUnusedBallsFirst = (pileBalls: PileBall[]) =>
  [...pileBalls].sort(
    (one, other) => Number(isUsed(one)) - Number(isUsed(other)),
  );

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

const getTablePoints = (halfWidth: number, height: number) => [
  { x: -halfWidth, y: height - TABLE_WALL_HEIGHT },
  { x: -halfWidth, y: height },
  { x: halfWidth, y: height },
  { x: halfWidth, y: height - TABLE_WALL_HEIGHT },
];

const getSpreadForBall = (id: number) => ((id * 0.618) % 1) - 0.5;

export class BowlWorld {
  readonly radius: number;
  readonly baseRadius: number;
  readonly depth: number;
  readonly tableHalfWidth: number;
  private world = new World({ gravity: { x: 0, y: GRAVITY } });
  private ballBodies = new Map<number, BallBody>();
  private unsimulatedTime = 0;
  private replaying = false;
  private pourQueue: PileBall[] = [];
  private pileQueue: PileBall[][] = [];
  private secondsUntilNextReplayStep = 0;

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
    this.tableHalfWidth = this.radius + TABLE_OVERHANG;
    this.world
      .createBody()
      .createFixture(
        new Chain(getTablePoints(this.tableHalfWidth, this.depth)),
        { friction: BOWL_FRICTION },
      );
  }

  replayPiles([firstPile = [], ...laterPiles]: PileBall[][]) {
    this.pourQueue = sortUnusedBallsFirst(
      [...firstPile].sort(
        (one, other) =>
          getSpreadForBall(one.ball.id) - getSpreadForBall(other.ball.id),
      ),
    );
    this.pileQueue = laterPiles;
    this.secondsUntilNextReplayStep = 0;
    this.replaying = true;
  }

  syncBalls(pileBalls: PileBall[]) {
    if (this.replaying) {
      this.pileQueue.push(pileBalls);
    } else {
      this.applyPile(pileBalls);
    }
  }

  private applyPile(pileBalls: PileBall[]) {
    const ids = new Set(pileBalls.map(({ ball }) => ball.id));
    this.ballBodies.forEach((ballBody, id) => {
      if (!ids.has(id)) ballBody.size = retargetTween(ballBody.size, 0);
    });

    const newBalls = pileBalls.filter(
      ({ ball }) => !this.ballBodies.has(ball.id),
    );
    const isUnusedBallAdded = newBalls.some((pileBall) => !isUsed(pileBall));
    pileBalls.forEach((pileBall) => {
      const ballBody = this.ballBodies.get(pileBall.ball.id);
      if (!ballBody || !isUsed(pileBall)) return;
      if (isUnusedBallAdded || !isUsed(ballBody.pileBall)) {
        this.liftBall(ballBody);
      }
    });

    this.dropBalls(sortUnusedBallsFirst(newBalls));
    pileBalls.forEach((pileBall) => this.retargetBall(pileBall));
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
    this.removeVanishedBalls();
    for (let step = 0; step < MAX_SETTLE_STEPS && !this.isAtRest(); step++) {
      this.stepWorld();
    }
  }

  isAtRest() {
    return (
      !this.replaying &&
      [...this.ballBodies.values()].every(
        ({ body, size, greyness }) =>
          !body.isAwake() && !isTweenRunning(size) && !isTweenRunning(greyness),
      )
    );
  }

  getBalls(): PlacedBall[] {
    return [...this.ballBodies.values()].map(
      ({ pileBall, body, fixtureSize, greyness }) => ({
        ...pileBall,
        ...body.getPosition(),
        size: fixtureSize,
        angle: body.getAngle(),
        greyness: getTweenValue(greyness),
      }),
    );
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

  private getDropPosition(id: number, slot: number, dropHeight: number) {
    const columns = this.getColumns();
    const row = Math.floor(slot / columns);
    const column = slot % columns;
    const x =
      -this.radius + 1 + column + (row % 2) * 0.5 + getSpreadForBall(id) * 0.2;
    const y = dropHeight - DROP_CLEARANCE - row;
    return { x, y };
  }

  private dropBalls(pileBalls: PileBall[]) {
    const dropHeight = this.getTopOfPile();
    const firstSlot = Math.floor(
      (getSpreadForBall(pileBalls[0]?.ball.id ?? 0) + 0.5) * this.getColumns(),
    );
    pileBalls.forEach((pileBall, index) =>
      this.addBall(
        pileBall,
        this.getDropPosition(pileBall.ball.id, firstSlot + index, dropHeight),
      ),
    );
  }

  private liftBall(ballBody: BallBody) {
    ballBody.rising = true;
    ballBody.size = retargetTween(ballBody.size, 0);
  }

  private stepReplay() {
    if (!this.replaying) return;

    this.secondsUntilNextReplayStep -= TIME_STEP;
    if (this.secondsUntilNextReplayStep > 0) return;

    const pileBall = this.pourQueue.shift();
    if (pileBall) {
      this.pourBall(pileBall);
      this.secondsUntilNextReplayStep =
        this.pourQueue.length > 0 ? POUR_INTERVAL : PAUSE_BETWEEN_CHANGES;
      return;
    }

    const pile = this.pileQueue.shift();
    if (!pile) {
      this.replaying = false;
      return;
    }

    this.applyPile(pile);
    this.secondsUntilNextReplayStep = PAUSE_BETWEEN_CHANGES;
  }

  private pourBall(pileBall: PileBall) {
    const spread = getSpreadForBall(pileBall.ball.id);
    this.addBall(
      pileBall,
      { x: this.radius * POUR_X_TO_RADIUS + spread * 0.3, y: -POUR_HEIGHT },
      POUR_VELOCITY,
      spread * POUR_SPIN,
    );
  }

  private addBall(
    pileBall: PileBall,
    position: Vec2Value,
    linearVelocity: Vec2Value = { x: 0, y: 0 },
    angularVelocity = 0,
  ) {
    const { ball } = pileBall;
    const body = this.world.createDynamicBody({
      position,
      linearVelocity,
      angularVelocity,
      ...BALL_DAMPING,
    });
    const ballBody = {
      pileBall,
      rising: false,
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

    ballBody.pileBall = pileBall;
    if (!ballBody.rising) {
      ballBody.size = retargetTween(ballBody.size, getBallSize(pileBall.ball));
    }
    ballBody.greyness = retargetTween(ballBody.greyness, getGreyness(pileBall));
  }

  private stepWorld() {
    this.stepReplay();
    this.ballBodies.forEach((ballBody) => {
      ballBody.size = advanceTween(ballBody.size, TIME_STEP);
      ballBody.greyness = advanceTween(ballBody.greyness, TIME_STEP);
      this.applyBallSize(ballBody);
    });
    this.removeVanishedBalls();
    this.world.step(TIME_STEP);
  }

  private removeVanishedBalls() {
    const risenBalls: PileBall[] = [];
    this.ballBodies.forEach(({ body, fixtureSize, rising, pileBall }, id) => {
      if (fixtureSize > 0) return;

      this.world.destroyBody(body);
      this.ballBodies.delete(id);
      if (rising) risenBalls.push(pileBall);
    });
    this.dropBalls(risenBalls);
  }

  private applyBallSize(ballBody: BallBody) {
    const size = getTweenValue(ballBody.size);
    if (size === ballBody.fixtureSize) return;

    const fixture = ballBody.body.getFixtureList();
    if (fixture) ballBody.body.destroyFixture(fixture);
    if (size > 0) {
      ballBody.body.createFixture(new Circle(getBallRadius(size)), BALL_BODY);
    }
    ballBody.body.setAwake(true);
    ballBody.fixtureSize = size;
  }
}

export function createSettledBowlWorld(pileBalls: PileBall[]) {
  const world = new BowlWorld(pileBalls);
  world.syncBalls(pileBalls);
  world.settle();
  return world;
}
