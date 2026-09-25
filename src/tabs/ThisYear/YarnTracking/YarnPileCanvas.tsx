import { PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { PlacedBall } from './bowlWorld';
import { Bowl, createBallSprites, drawPile } from './drawPile';
import { getBallDetails } from './yarnBallText';
import { useYarnStorage } from './YarnStorageContext';

const EFFECTS_BLEED = 8;

const isPointerOverBall = (x: number, y: number, ball: PlacedBall) =>
  Math.hypot(x - ball.x, y - ball.y) <= ball.size / 2;

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
  const [hoveredBall, setHoveredBall] = useState<PlacedBall>();
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

  const findHoveredBall = (event: PointerEvent<HTMLCanvasElement>) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left - EFFECTS_BLEED;
    const y = event.clientY - top - EFFECTS_BLEED;
    setHoveredBall(balls.find((ball) => isPointerOverBall(x, y, ball)));
  };

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
        onPointerMove={findHoveredBall}
        onPointerLeave={() => setHoveredBall(undefined)}
      />
      {hoveredBall && (
        <div className="tooltip-container">
          <div
            className="tooltip-anchor"
            style={{
              left: hoveredBall.x - hoveredBall.size / 2,
              top: hoveredBall.y - hoveredBall.size / 2,
              width: hoveredBall.size,
              height: hoveredBall.size,
            }}
          />
          <div className="tooltip" role="tooltip">
            {getBallDetails(
              hoveredBall.ball,
              getBalance(hoveredBall.ball.yarnType),
            )}
          </div>
        </div>
      )}
    </>
  );
}
