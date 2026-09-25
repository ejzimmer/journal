import { PlacedBall } from './bowlWorld';
import { YARN_COLOURS } from './utils';
import { YARN_TYPE_IDS, YarnTypeId } from './types';
import {
  drawBallShading,
  drawYarnWindings,
} from '../../../shared/icons/drawBallOfYarn';

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
  radius: number;
  baseRadius: number;
  depth: number;
  rimDepth: number;
};

function createBallSprite(
  pixelRatio: number,
  draw: (context: CanvasRenderingContext2D) => void,
) {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = Math.ceil(BALL_SIZE * pixelRatio);
  const context = sprite.getContext('2d');
  if (context) {
    context.scale(sprite.width / ICON_SIZE, sprite.height / ICON_SIZE);
    draw(context);
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

export type BallSprites = {
  windings: Record<YarnTypeId, HTMLCanvasElement>;
  shading: HTMLCanvasElement;
};

export const createBallSprites = (pixelRatio: number): BallSprites => ({
  windings: Object.fromEntries(
    YARN_TYPE_IDS.map((yarnType) => [
      yarnType,
      createBallSprite(pixelRatio, (context) =>
        drawYarnWindings(context, YARN_COLOURS[yarnType]),
      ),
    ]),
  ) as Record<YarnTypeId, HTMLCanvasElement>,
  shading: createBallSprite(pixelRatio, drawBallShading),
});

function traceBowlBody(
  context: CanvasRenderingContext2D,
  { x, y, radius, baseRadius, depth }: Bowl,
) {
  const sideWidth = radius - baseRadius;
  context.beginPath();
  context.ellipse(x + baseRadius, y, sideWidth, depth, 0, 0, Math.PI / 2);
  context.lineTo(x - baseRadius, y + depth);
  context.ellipse(x - baseRadius, y, sideWidth, depth, 0, Math.PI / 2, Math.PI);
}

function drawBowlBack(context: CanvasRenderingContext2D, bowl: Bowl) {
  traceBowlBody(context, bowl);
  context.fillStyle = GLASS.tint;
  context.fill();

  context.beginPath();
  context.ellipse(bowl.x, bowl.y, bowl.radius, bowl.rimDepth, 0, Math.PI, 0);
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
  context.ellipse(bowl.x, bowl.y, bowl.radius, bowl.rimDepth, 0, 0, Math.PI);
  context.strokeStyle = GLASS.edge;
  context.lineWidth = 1.5;
  context.stroke();

  context.beginPath();
  context.ellipse(
    bowl.x - bowl.baseRadius,
    bowl.y,
    (bowl.radius - bowl.baseRadius) * 0.8,
    bowl.depth * 0.85,
    0,
    Math.PI * 0.6,
    Math.PI * 0.85,
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
  context.drawImage(
    sprites.windings[ball.yarnType],
    -size / 2,
    -size / 2,
    size,
    size,
  );
  context.rotate(-angle);
  context.shadowColor = 'transparent';
  context.drawImage(sprites.shading, -size / 2, -size / 2, size, size);
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
