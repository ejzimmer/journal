import { HANG_GOAL_SECONDS } from './deadHang';
import { INNER_RING_RADIUS } from './ringGeometry';
import { RingArc } from './RingArc';
import { RingTrack } from './RingTrack';

type LongestHangRingProps = {
  longestHang: number;
  liveHangSeconds: number;
};

export function LongestHangRing({
  longestHang,
  liveHangSeconds,
}: LongestHangRingProps) {
  const isFull = Math.max(longestHang, liveHangSeconds) >= HANG_GOAL_SECONDS;
  return (
    <>
      <RingTrack radius={INNER_RING_RADIUS} />
      <RingArc
        radius={INNER_RING_RADIUS}
        from={0}
        to={longestHang / HANG_GOAL_SECONDS}
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
