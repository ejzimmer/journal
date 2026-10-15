import { HANG_GOAL_SECONDS } from './deadHang';
import { INNER_RING_RADIUS } from './ringGeometry';
import { RingArc } from './RingArc';
import { RingTrack } from './RingTrack';

type BestHangRingProps = {
  bestHang: number;
  liveHangSeconds: number;
};

export function BestHangRing({ bestHang, liveHangSeconds }: BestHangRingProps) {
  const isFull = Math.max(bestHang, liveHangSeconds) >= HANG_GOAL_SECONDS;
  return (
    <>
      <RingTrack radius={INNER_RING_RADIUS} />
      <RingArc
        radius={INNER_RING_RADIUS}
        from={0}
        to={bestHang / HANG_GOAL_SECONDS}
        className={isFull ? 'complete' : 'longest'}
      />
      <RingArc
        radius={INNER_RING_RADIUS}
        from={0}
        to={liveHangSeconds / HANG_GOAL_SECONDS}
        className={isFull ? 'complete' : 'current'}
      />
    </>
  );
}
