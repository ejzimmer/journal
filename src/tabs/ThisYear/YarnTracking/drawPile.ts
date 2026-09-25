import { PlacedBall, BALL_SIZE } from './layOutPile';
import { YARN_COLOURS } from './utils';
import { YARN_TYPE_IDS, YarnTypeId } from './types';
import { drawBallOfYarn } from '../../../shared/icons/drawBallOfYarn';

const ICON_SIZE = 20;

function createBallSprite(colour: string, scale: number) {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = Math.ceil(BALL_SIZE * scale);
  const context = sprite.getContext('2d');
  if (context) {
    context.scale(sprite.width / ICON_SIZE, sprite.height / ICON_SIZE);
    drawBallOfYarn(context, colour);
  }
  return sprite;
}

function applyBallEffects(
  context: CanvasRenderingContext2D,
  scale: number,
  fade?: number,
) {
  if (fade === undefined) {
    context.shadowOffsetX = scale;
    context.shadowOffsetY = 2 * scale;
    context.shadowBlur = 2 * scale;
    context.shadowColor = 'rgb(0 0 0 / 0.25)';
  } else {
    context.globalAlpha = 0.55 * (1 - fade);
    context.filter = `grayscale(${0.3 + 0.7 * fade}) blur(${(1.5 + 4 * fade) * scale}px)`;
  }
}

export type BallSprites = Record<YarnTypeId, HTMLCanvasElement>;

export const createBallSprites = (scale: number) =>
  Object.fromEntries(
    YARN_TYPE_IDS.map((yarnType) => [
      yarnType,
      createBallSprite(YARN_COLOURS[yarnType], scale),
    ]),
  ) as BallSprites;

export function drawPile(
  context: CanvasRenderingContext2D,
  balls: PlacedBall[],
  sprites: BallSprites,
  scale: number,
) {
  balls.forEach(({ ball, fade, x, y, size }) => {
    context.save();
    applyBallEffects(context, scale, fade);
    context.drawImage(
      sprites[ball.yarnType],
      x - size / 2,
      y - size / 2,
      size,
      size,
    );
    context.restore();
  });
}
