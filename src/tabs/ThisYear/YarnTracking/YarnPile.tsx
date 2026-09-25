import {
  PointerEvent,
  RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PileBall } from './pileBalls';
import { layOutPile, PlacedBall } from './layOutPile';
import { createBallSprites, drawPile } from './drawPile';
import { getBallDetails } from './yarnBallText';
import { useYarnStorage } from './YarnStorageContext';

function useElementWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measureWidth = () => setWidth(element.getBoundingClientRect().width);
    measureWidth();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measureWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

const EFFECTS_BLEED = 8;

const isPointerOverBall = (x: number, y: number, ball: PlacedBall) =>
  Math.hypot(x - ball.x, y - ball.y) <= ball.size / 2;

export function YarnPile({ balls }: { balls: PileBall[] }) {
  const { getBalance } = useYarnStorage();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useElementWidth(containerRef);
  const layout = useMemo(() => layOutPile(balls, width), [balls, width]);
  const [hoveredBall, setHoveredBall] = useState<PlacedBall>();
  const scale = window.devicePixelRatio;
  const sprites = useMemo(() => createBallSprites(scale), [scale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    canvas.width = (width + 2 * EFFECTS_BLEED) * scale;
    canvas.height = (layout.height + 2 * EFFECTS_BLEED) * scale;
    context.scale(scale, scale);
    context.translate(EFFECTS_BLEED, EFFECTS_BLEED);
    drawPile(context, layout.balls, sprites, scale);
  }, [layout, width, sprites, scale]);

  const findHoveredBall = (event: PointerEvent<HTMLCanvasElement>) => {
    const { left, top } = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - left - EFFECTS_BLEED;
    const y = event.clientY - top - EFFECTS_BLEED;
    setHoveredBall(layout.balls.find((ball) => isPointerOverBall(x, y, ball)));
  };

  return (
    <div ref={containerRef} className="yarn-pile">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Pile of yarn"
        style={{
          width: width + 2 * EFFECTS_BLEED,
          height: layout.height + 2 * EFFECTS_BLEED,
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
    </div>
  );
}
