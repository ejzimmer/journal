import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { PileBall } from './pileBalls';
import { BowlWorld, PlacedBall, createSettledBowlWorld } from './bowlWorld';
import { BALL_SIZE } from './drawPile';
import { YarnPileCanvas } from './YarnPileCanvas';
import {
  advanceTween,
  createTween,
  getTweenValue,
  isTweenRunning,
  retargetTween,
} from './tween';

const BOWL_MARGIN = 0.3;
const RIM_DEPTH_TO_RADIUS = 0.12;
const HEADROOM_DURATION = 0.5;

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

const isReducedMotionPreferred = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function createPouringBowlWorld(balls: PileBall[], ballsToPour: PileBall[]) {
  const world = new BowlWorld(balls);
  world.pourBalls(ballsToPour);
  return world;
}

function useAnimatedBalls(world: BowlWorld, balls: PileBall[]) {
  const [frame, setFrame] = useState(() => ({
    balls: world.getBalls(),
    pileTop: world.getTopOfPile(),
  }));
  const pileTopRef = useRef(createTween(frame.pileTop, HEADROOM_DURATION));

  useEffect(() => {
    world.syncBalls(balls);

    let frameId = 0;
    let lastTime = performance.now();
    const showNextFrame = (time: number) => {
      const seconds = (time - lastTime) / 1000;
      lastTime = time;
      world.advance(seconds);

      const pileTop = pileTopRef.current;
      const restingTop = world.isAtRest()
        ? Math.min(pileTop.to, world.getTopOfPile())
        : pileTop.to;
      pileTopRef.current = advanceTween(
        retargetTween(pileTop, restingTop),
        seconds,
      );

      setFrame({
        balls: world.getBalls(),
        pileTop: getTweenValue(pileTopRef.current),
      });
      if (!world.isAtRest() || isTweenRunning(pileTopRef.current)) {
        frameId = requestAnimationFrame(showNextFrame);
      }
    };
    frameId = requestAnimationFrame(showNextFrame);

    return () => cancelAnimationFrame(frameId);
  }, [world, balls]);

  return frame;
}

function placeBowlScene(
  world: BowlWorld,
  balls: PlacedBall[],
  pileTop: number,
  width: number,
) {
  const rimDepth = world.radius * RIM_DEPTH_TO_RADIUS;
  const top = Math.min(pileTop, -rimDepth) - BOWL_MARGIN;
  const unitSize = Math.min(BALL_SIZE, width / (2 * world.tableHalfWidth));
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
      tableHalfWidth: world.tableHalfWidth * unitSize,
    },
    height: (world.depth + BOWL_MARGIN - top) * unitSize,
  };
}

type YarnPileProps = {
  balls: PileBall[];
  lastMonthBalls: PileBall[];
};

export function YarnPile({ balls, lastMonthBalls }: YarnPileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(containerRef);
  const [world] = useState(() =>
    isReducedMotionPreferred()
      ? createSettledBowlWorld(balls)
      : createPouringBowlWorld(balls, lastMonthBalls),
  );
  const frame = useAnimatedBalls(world, balls);
  const scene = useMemo(
    () => placeBowlScene(world, frame.balls, frame.pileTop, width),
    [world, frame, width],
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
