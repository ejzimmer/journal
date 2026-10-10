import { calculateHangArcs, SESSION_GOAL_SECONDS } from './deadHang';
import { OUTER_RING_RADIUS } from './ringGeometry';
import { RingArc } from './RingArc';
import { RingTrack } from './RingTrack';

const GAP_BETWEEN_HANGS = 0.012;

type SessionRingProps = {
  hangs: number[];
  liveHangSeconds: number;
};

export function SessionRing({ hangs, liveHangSeconds }: SessionRingProps) {
  const sessionTotal = hangs.reduce((total, hang) => total + hang, 0);
  const isFull = sessionTotal + liveHangSeconds >= SESSION_GOAL_SECONDS;

  if (isFull) {
    return (
      <>
        <RingTrack radius={OUTER_RING_RADIUS} />
        <RingArc
          radius={OUTER_RING_RADIUS}
          from={0}
          to={1}
          className="complete"
        />
      </>
    );
  }

  const liveFrom = sessionTotal / SESSION_GOAL_SECONDS;

  return (
    <>
      <RingTrack radius={OUTER_RING_RADIUS} />
      {calculateHangArcs(hangs).map(({ from, to }, index) => (
        <RingArc
          key={index}
          radius={OUTER_RING_RADIUS}
          from={from}
          to={to - GAP_BETWEEN_HANGS}
          className="hang"
        />
      ))}
      <RingArc
        radius={OUTER_RING_RADIUS}
        from={liveFrom}
        to={liveFrom + liveHangSeconds / SESSION_GOAL_SECONDS}
        className="live"
      />
    </>
  );
}
