import { useEffect, useId, useState } from 'react';
import { getToday } from '../../shared/dates';
import { useHealthStorage } from './HealthStorageContext';
import {
  getTodaysHangs,
  HANG_GOAL_SECONDS,
  measureFinishedHang,
  measureLiveHang,
  SESSION_GOAL_SECONDS,
} from './deadHang';
import { RING_SIZE } from './ringGeometry';
import { SessionRing } from './SessionRing';
import { LongestHangRing } from './LongestHangRing';
import './DeadHangCard.css';

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
    if (!isHanging) {
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
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
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

function formatSeconds(seconds: number) {
  return Math.round(seconds);
}
