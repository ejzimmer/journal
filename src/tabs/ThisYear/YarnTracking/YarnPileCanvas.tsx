import { useEffect, useMemo, useRef, useState } from 'react';
import { CursorPositionedTooltip } from '../../../shared/controls/CursorPositionedTooltip';
import { createHoverHandlers } from '../../../shared/controls/createHoverHandlers';
import {
  isTouch,
  PointerPosition,
} from '../../../shared/controls/pointerPosition';
import { useTouchLongPress } from '../../../shared/controls/useTouchLongPress';
import { PlacedBall } from './bowlWorld';
import { Bowl, createBallSprites, drawPile } from './drawPile';
import { getBallDetails } from './yarnBallText';
import { useYarnStorage } from './YarnStorageContext';

const EFFECTS_BLEED = 8;

const isPointerOverBall = (x: number, y: number, ball: PlacedBall) =>
  Math.hypot(x - ball.x, y - ball.y) <= ball.size / 2;

type HoveredBall = { placed: PlacedBall; pileLeft: number; pileTop: number };

type YarnPileCanvasProps = {
  balls: PlacedBall[];
  bowl: Bowl;
  width: number;
  height: number;
};

export function YarnPileCanvas({
  balls,
  bowl,
  width,
  height,
}: YarnPileCanvasProps) {
  const { getBalance } = useYarnStorage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredBall, setHoveredBall] = useState<HoveredBall>();
  const pixelRatio = window.devicePixelRatio;
  const sprites = useMemo(() => createBallSprites(pixelRatio), [pixelRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    canvas.width = (width + 2 * EFFECTS_BLEED) * pixelRatio;
    canvas.height = (height + 2 * EFFECTS_BLEED) * pixelRatio;
    context.scale(pixelRatio, pixelRatio);
    context.translate(EFFECTS_BLEED, EFFECTS_BLEED);
    drawPile(context, balls, bowl, sprites, pixelRatio);
  }, [balls, bowl, width, height, sprites, pixelRatio]);

  const hideTooltip = () => setHoveredBall(undefined);

  const findBallUnderPointer = (event: PointerPosition) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left - EFFECTS_BLEED;
    const y = event.clientY - top - EFFECTS_BLEED;
    const placed = balls.find((ball) => isPointerOverBall(x, y, ball));
    setHoveredBall((current) =>
      current?.placed === placed
        ? current
        : placed && {
            placed,
            pileLeft: left + EFFECTS_BLEED,
            pileTop: top + EFFECTS_BLEED,
          },
    );
  };

  const longPressHandlers = useTouchLongPress({
    onShow: findBallUnderPointer,
    onHide: hideTooltip,
  });

  return (
    <>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Pile of yarn"
        style={{
          width: width + 2 * EFFECTS_BLEED,
          height: height + 2 * EFFECTS_BLEED,
          margin: -EFFECTS_BLEED,
        }}
        {...createHoverHandlers({
          onShow: findBallUnderPointer,
          onHide: hideTooltip,
        })}
        {...longPressHandlers}
        onPointerMove={(event) => {
          if (!isTouch(event)) findBallUnderPointer(event);
        }}
      />
      {hoveredBall && (
        <CursorPositionedTooltip
          rect={{
            left:
              hoveredBall.pileLeft +
              hoveredBall.placed.x -
              hoveredBall.placed.size / 2,
            top:
              hoveredBall.pileTop +
              hoveredBall.placed.y -
              hoveredBall.placed.size / 2,
            width: hoveredBall.placed.size,
            height: hoveredBall.placed.size,
          }}
        >
          {getBallDetails(
            hoveredBall.placed.ball,
            getBalance(hoveredBall.placed.ball.yarnType),
          )}
        </CursorPositionedTooltip>
      )}
    </>
  );
}
