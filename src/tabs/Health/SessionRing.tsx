import { SESSION_GOAL_SECONDS } from './deadHang';
import { OUTER_RING_RADIUS } from './ringGeometry';
import { RingArc } from './RingArc';
import { RingTrack } from './RingTrack';

const GAP_BETWEEN_HANGS = 0.012;

type SessionRingProps = {
  hangs: number[];
  liveHangSeconds: number;
};

export function SessionRing({ hangs, liveHangSeconds }: SessionRingProps) {
  const isFull =
    hangs.reduce((total, hang) => total + hang, liveHangSeconds) >=
    SESSION_GOAL_SECONDS;

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

  const arcs = hangs.map((hang, index) => {
    const from =
      hangs.slice(0, index).reduce((total, h) => total + h, 0) /
      SESSION_GOAL_SECONDS;
    const to = from + hang / SESSION_GOAL_SECONDS;
    return { from, to: Math.max(from, to - GAP_BETWEEN_HANGS) };
  });
  const liveFrom =
    hangs.reduce((total, hang) => total + hang, 0) / SESSION_GOAL_SECONDS;

  return (
    <>
      <RingTrack radius={OUTER_RING_RADIUS} />
      {arcs.map(({ from, to }, index) => (
        <RingArc
          key={index}
          radius={OUTER_RING_RADIUS}
          from={from}
          to={to}
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
