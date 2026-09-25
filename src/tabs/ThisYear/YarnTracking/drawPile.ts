import { PlacedBall } from './bowlWorld';
import { YARN_COLOURS } from './utils';
import { YARN_TYPE_IDS, YarnTypeId } from './types';
import { drawBallOfYarn } from '../../../shared/icons/drawBallOfYarn';

export const BALL_SIZE = 48;
const ICON_SIZE = 20;
const GLASS = {
  tint: 'rgb(190 215 235 / 0.2)',
  edge: 'rgb(120 145 170 / 0.55)',
  rim: 'rgb(120 145 170 / 0.35)',
  highlight: 'rgb(255 255 255 / 0.45)',
};

export type Bowl = {
  x: number;
  y: number;
  halfWidth: number;
  depth: number;
  rimDepth: number;
};

function createBallSprite(colour: string, pixelRatio: number) {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = Math.ceil(BALL_SIZE * pixelRatio);
  const context = sprite.getContext('2d');
  if (context) {
    context.scale(sprite.width / ICON_SIZE, sprite.height / ICON_SIZE);
    drawBallOfYarn(context, colour);
  }
  return sprite;
}

function applyBallEffects(
  context: CanvasRenderingContext2D,
  pixelRatio: number,
  fade?: number,
) {
  if (fade === undefined) {
    context.shadowOffsetX = pixelRatio;
    context.shadowOffsetY = 2 * pixelRatio;
    context.shadowBlur = 2 * pixelRatio;
    context.shadowColor = 'rgb(0 0 0 / 0.25)';
  } else {
    context.globalAlpha = 0.55 * (1 - fade);
    context.filter = `grayscale(${0.3 + 0.7 * fade}) blur(${(1.5 + 4 * fade) * pixelRatio}px)`;
  }
}

export type BallSprites = Record<YarnTypeId, HTMLCanvasElement>;

export const createBallSprites = (pixelRatio: number) =>
  Object.fromEntries(
    YARN_TYPE_IDS.map((yarnType) => [
      yarnType,
      createBallSprite(YARN_COLOURS[yarnType], pixelRatio),
    ]),
  ) as BallSprites;

function traceBowlBody(context: CanvasRenderingContext2D, bowl: Bowl) {
  context.beginPath();
  context.ellipse(bowl.x, bowl.y, bowl.halfWidth, bowl.depth, 0, 0, Math.PI);
}

function drawBowlBack(context: CanvasRenderingContext2D, bowl: Bowl) {
  traceBowlBody(context, bowl);
  context.fillStyle = GLASS.tint;
  context.fill();

  context.beginPath();
  context.ellipse(bowl.x, bowl.y, bowl.halfWidth, bowl.rimDepth, 0, Math.PI, 0);
  context.strokeStyle = GLASS.rim;
  context.lineWidth = 1.5;
  context.stroke();
}

function drawBowlFront(context: CanvasRenderingContext2D, bowl: Bowl) {
  traceBowlBody(context, bowl);
  context.strokeStyle = GLASS.edge;
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.ellipse(bowl.x, bowl.y, bowl.halfWidth, bowl.rimDepth, 0, 0, Math.PI);
  context.strokeStyle = GLASS.edge;
  context.lineWidth = 1.5;
  context.stroke();

  context.beginPath();
  context.ellipse(
    bowl.x,
    bowl.y,
    bowl.halfWidth * 0.9,
    bowl.depth * 0.85,
    0,
    Math.PI * 0.62,
    Math.PI * 0.8,
  );
  context.strokeStyle = GLASS.highlight;
  context.lineWidth = 3;
  context.lineCap = 'round';
  context.stroke();
}

function drawBall(
  context: CanvasRenderingContext2D,
  { ball, fade, x, y, size, angle }: PlacedBall,
  sprites: BallSprites,
  pixelRatio: number,
) {
  context.save();
  applyBallEffects(context, pixelRatio, fade);
  context.translate(x, y);
  context.rotate(angle);
  context.drawImage(sprites[ball.yarnType], -size / 2, -size / 2, size, size);
  context.restore();
}

export function drawPile(
  context: CanvasRenderingContext2D,
  balls: PlacedBall[],
  bowl: Bowl,
  sprites: BallSprites,
  pixelRatio: number,
) {
  drawBowlBack(context, bowl);
  balls.forEach((ball) => drawBall(context, ball, sprites, pixelRatio));
  drawBowlFront(context, bowl);
}
