import { useEffect, useId, useState } from 'react';
import { getToday } from '../../shared/dates';
import { useHealthStorage } from './HealthStorageContext';
import {
  createArcPath,
  getTodaysHangs,
  HANG_GOAL_SECONDS,
  measureFinishedHang,
  measureLiveHang,
  SESSION_GOAL_SECONDS,
} from './deadHang';
import './DeadHangCard.css';

const SIZE = 150;
const CENTRE = SIZE / 2;
const OUTER_RADIUS = 66;
const INNER_RADIUS = 51;
const RING_WIDTH = 10;
const GAP_BETWEEN_HANGS = 0.012;

export function DeadHangCard() {
  const { deadHang, setDeadHang } = useHealthStorage();
  const [pressedStartAt, setPressedStartAt] = useState<number | null>(null);
  const [liveHangSeconds, setLiveHangSeconds] = useState(0);
  const nameId = useId();

  useEffect(() => {
    if (pressedStartAt === null) return;
    let frame = requestAnimationFrame(function tick() {
      setLiveHangSeconds(measureLiveHang(pressedStartAt, Date.now()));
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [pressedStartAt]);

  const hangs = getTodaysHangs(deadHang);
  const isHanging = pressedStartAt !== null;
  const sessionTotal = hangs.reduce((total, hang) => total + hang, 0);
  const longestHang = Math.max(0, ...hangs);

  const toggleHang = () => {
    if (pressedStartAt === null) {
      setPressedStartAt(Date.now());
      return;
    }
    const hang = measureFinishedHang(pressedStartAt, Date.now());
    setPressedStartAt(null);
    setLiveHangSeconds(0);
    if (hang > 0) {
      setDeadHang({ date: getToday(), hangs: [...hangs, hang] });
    }
  };

  return (
    <li className="tracker-card dead-hang" aria-labelledby={nameId}>
      <div id={nameId} className="name">
        Dead hang
      </div>
      <div className="rings">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${formatSeconds(sessionTotal)} of ${SESSION_GOAL_SECONDS} seconds today, longest hang ${formatSeconds(longestHang)} of ${HANG_GOAL_SECONDS} seconds`}
        >
          <SessionRing hangs={hangs} liveHangSeconds={liveHangSeconds} />
          <LongestHangRing
            longestHang={longestHang}
            liveHangSeconds={liveHangSeconds}
          />
        </svg>
        <button
          className="hang"
          aria-label={isHanging ? 'Stop hang' : 'Start hang'}
          aria-pressed={isHanging}
          onClick={toggleHang}
        >
          {isHanging ? (
            <span className="seconds">{Math.floor(liveHangSeconds)}</span>
          ) : (
            <svg viewBox="0 0 20 20" className="play">
              <path d="M6,4 L16,10 L6,16 Z" />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
}

function SessionRing({
  hangs,
  liveHangSeconds,
}: {
  hangs: number[];
  liveHangSeconds: number;
}) {
  const isFull =
    hangs.reduce((total, hang) => total + hang, liveHangSeconds) >=
    SESSION_GOAL_SECONDS;

  if (isFull) {
    return (
      <>
        <Track radius={OUTER_RADIUS} />
        <Arc radius={OUTER_RADIUS} from={0} to={1} className="complete" />
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
      <Track radius={OUTER_RADIUS} />
      {arcs.map(({ from, to }, index) => (
        <Arc
          key={index}
          radius={OUTER_RADIUS}
          from={from}
          to={to}
          className="hang"
        />
      ))}
      <Arc
        radius={OUTER_RADIUS}
        from={liveFrom}
        to={liveFrom + liveHangSeconds / SESSION_GOAL_SECONDS}
        className="live"
      />
    </>
  );
}

function LongestHangRing({
  longestHang,
  liveHangSeconds,
}: {
  longestHang: number;
  liveHangSeconds: number;
}) {
  const isFull = Math.max(longestHang, liveHangSeconds) >= HANG_GOAL_SECONDS;
  return (
    <>
      <Track radius={INNER_RADIUS} />
      <Arc
        radius={INNER_RADIUS}
        from={0}
        to={longestHang / HANG_GOAL_SECONDS}
        className={isFull ? 'complete' : 'longest'}
      />
      <Arc
        radius={INNER_RADIUS}
        from={0}
        to={liveHangSeconds / HANG_GOAL_SECONDS}
        className={isFull ? 'complete' : 'current'}
      />
    </>
  );
}

function Track({ radius }: { radius: number }) {
  return (
    <circle
      className="track"
      cx={CENTRE}
      cy={CENTRE}
      r={radius}
      strokeWidth={RING_WIDTH}
    />
  );
}

function Arc({
  radius,
  from,
  to,
  className,
}: {
  radius: number;
  from: number;
  to: number;
  className: string;
}) {
  const end = Math.min(1, to);
  if (end <= from) return null;
  if (end - from >= 1) {
    return (
      <circle
        className={className}
        cx={CENTRE}
        cy={CENTRE}
        r={radius}
        strokeWidth={RING_WIDTH}
      />
    );
  }
  const capLength = RING_WIDTH / 2 / (2 * Math.PI * radius);
  const capStart = from + capLength;
  const capEnd = Math.max(capStart + 0.0001, end - capLength);
  return (
    <path
      className={className}
      d={createArcPath(CENTRE, radius, capStart, capEnd)}
      strokeWidth={RING_WIDTH}
      strokeLinecap="round"
    />
  );
}

function formatSeconds(seconds: number) {
  return Math.round(seconds);
}
