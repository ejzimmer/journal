import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { PileBall } from './pileBalls';
import { BowlWorld, PlacedBall } from './bowlWorld';
import { BALL_SIZE } from './drawPile';
import { YarnPileCanvas } from './YarnPileCanvas';

const BOWL_MARGIN = 0.3;
const RIM_DEPTH_TO_RADIUS = 0.12;

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

function useAnimatedBalls(world: BowlWorld, balls: PileBall[]) {
  const [placedBalls, setPlacedBalls] = useState(() => world.getBalls());

  useEffect(() => {
    world.syncBalls(balls);

    let frame = 0;
    let lastTime = performance.now();
    const showNextFrame = (time: number) => {
      world.advance((time - lastTime) / 1000);
      lastTime = time;
      setPlacedBalls(world.getBalls());
      if (!world.isAtRest()) frame = requestAnimationFrame(showNextFrame);
    };
    frame = requestAnimationFrame(showNextFrame);

    return () => cancelAnimationFrame(frame);
  }, [world, balls]);

  return placedBalls;
}

function placeBowlScene(
  world: BowlWorld,
  balls: PlacedBall[],
  pileTop: number,
  width: number,
) {
  const rimDepth = world.radius * RIM_DEPTH_TO_RADIUS;
  const top = Math.min(pileTop, -rimDepth) - BOWL_MARGIN;
  const unitSize = Math.min(
    BALL_SIZE,
    width / (2 * (world.radius + BOWL_MARGIN)),
  );
  const originX = width / 2;
  const originY = -top * unitSize;

  return {
    balls: balls.map((ball) => ({
      ...ball,
      x: originX + ball.x * unitSize,
      y: originY + ball.y * unitSize,
      size: ball.size * unitSize,
    })),
    bowl: {
      x: originX,
      y: originY,
      radius: world.radius * unitSize,
      baseRadius: world.baseRadius * unitSize,
      depth: world.depth * unitSize,
      rimDepth: rimDepth * unitSize,
    },
    height: (world.depth + BOWL_MARGIN - top) * unitSize,
  };
}

export function YarnPile({ balls }: { balls: PileBall[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(containerRef);
  const [world] = useState(() => new BowlWorld(balls));
  const [pileTop] = useState(() => world.getTopOfPile());
  const placedBalls = useAnimatedBalls(world, balls);
  const scene = useMemo(
    () => placeBowlScene(world, placedBalls, pileTop, width),
    [world, placedBalls, pileTop, width],
  );

  return (
    <div ref={containerRef} className="yarn-pile">
      <YarnPileCanvas
        balls={scene.balls}
        bowl={scene.bowl}
        width={width}
        height={scene.height}
      />
    </div>
  );
}
