import { PlacedBall, BALL_SIZE } from './layOutPile';
import { YARN_COLOURS } from './utils';
import { YarnTypeId } from './types';
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

export function drawPile(
  context: CanvasRenderingContext2D,
  balls: PlacedBall[],
  scale: number,
) {
  const sprites = new Map<YarnTypeId, HTMLCanvasElement>();
  const getSprite = (yarnType: YarnTypeId) => {
    const sprite =
      sprites.get(yarnType) ?? createBallSprite(YARN_COLOURS[yarnType], scale);
    sprites.set(yarnType, sprite);
    return sprite;
  };

  balls.forEach(({ ball, fade, x, y, size }) => {
    context.save();
    applyBallEffects(context, scale, fade);
    context.drawImage(
      getSprite(ball.yarnType),
      x - size / 2,
      y - size / 2,
      size,
      size,
    );
    context.restore();
  });
}
