import { useEffect, useId, useState } from 'react';
import { getToday } from '../../shared/dates';
import { useHealthStorage } from './HealthStorageContext';
import { useTooltip } from '../../shared/useTooltip';
import {
  findBestHang,
  getTodaysHangs,
  HANG_GOAL_SECONDS,
  measureFinishedHang,
  measureLiveHang,
  SESSION_GOAL_SECONDS,
} from './deadHang';
import { RING_SIZE } from './ringGeometry';
import { SessionRing } from './SessionRing';
import { BestHangRing } from './BestHangRing';
import './DeadHangCard.css';

export function DeadHangCard() {
  const { deadHang, updateDeadHang } = useHealthStorage();
  const [pressedStartAt, setPressedStartAt] = useState<number | null>(null);
  const [liveHangSeconds, setLiveHangSeconds] = useState(0);
  const nameId = useId();
  const { createTooltipHandlers, tooltip } = useTooltip();

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
  const bestHang = findBestHang(deadHang);

  const toggleHang = () => {
    if (!isHanging) {
      setPressedStartAt(Date.now());
      return;
    }
    const hang = measureFinishedHang(pressedStartAt, Date.now());
    setPressedStartAt(null);
    setLiveHangSeconds(0);
    if (hang > 0) {
      updateDeadHang({
        date: getToday(),
        hangs: [...hangs, hang],
        bestHang: Math.max(bestHang, hang),
      });
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
          aria-label={`${sessionTotal} of ${SESSION_GOAL_SECONDS} seconds today, best hang ${bestHang} of ${HANG_GOAL_SECONDS} seconds`}
        >
          <g
            data-testid="session-ring"
            {...createTooltipHandlers(`${sessionTotal}s`)}
          >
            <SessionRing hangs={hangs} liveHangSeconds={liveHangSeconds} />
          </g>
          <g
            data-testid="best-hang-ring"
            {...createTooltipHandlers(`${bestHang}s`)}
          >
            <BestHangRing
              bestHang={bestHang}
              liveHangSeconds={liveHangSeconds}
            />
          </g>
        </svg>
        <button
          className="hang"
          aria-label={isHanging ? 'Stop hang' : 'Start hang'}
          aria-pressed={isHanging}
          onClick={toggleHang}
        >
          {isHanging ? (
            <span className="seconds">{liveHangSeconds}</span>
          ) : (
            <svg viewBox="0 0 20 20" className="play">
              <path d="M6,4 L16,10 L6,16 Z" />
            </svg>
          )}
        </button>
      </div>
      {tooltip}
    </li>
  );
}
