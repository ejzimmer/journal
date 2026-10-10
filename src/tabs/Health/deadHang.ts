import { DeadHangSession } from '../../shared/types';
import { isToday } from '../../shared/dates';

export const SESSION_GOAL_SECONDS = 60;
export const HANG_GOAL_SECONDS = 30;
export const MOUNTING_MS = 1000;

export function getTodaysHangs(session?: DeadHangSession) {
  return session && isToday(session.date) ? (session.hangs ?? []) : [];
}

export function isDeadHangSessionDone(hangs: number[]) {
  const sessionTotal = hangs.reduce((total, hang) => total + hang, 0);
  return (
    sessionTotal >= SESSION_GOAL_SECONDS &&
    Math.max(0, ...hangs) >= HANG_GOAL_SECONDS
  );
}

export function measureLiveHang(pressedStartAt: number, now: number) {
  return Math.floor(Math.max(0, now - pressedStartAt - MOUNTING_MS) / 1000);
}

export function measureFinishedHang(pressedStartAt: number, stoppedAt: number) {
  return measureLiveHang(pressedStartAt, stoppedAt - MOUNTING_MS);
}

export function calculateHangArcs(hangs: number[]) {
  let hungSoFar = 0;
  return hangs.map((hang) => {
    const from = hungSoFar / SESSION_GOAL_SECONDS;
    hungSoFar += hang;
    return { from, to: hungSoFar / SESSION_GOAL_SECONDS };
  });
}

export function createArcPath(
  centre: number,
  radius: number,
  from: number,
  to: number,
) {
  const pointAt = (fraction: number) => {
    const angle = (fraction - 0.25) * 2 * Math.PI;
    return `${centre + radius * Math.cos(angle)},${centre + radius * Math.sin(angle)}`;
  };
  const largeArc = to - from > 0.5 ? 1 : 0;
  return `M${pointAt(from)} A${radius},${radius} 0 ${largeArc} 1 ${pointAt(to)}`;
}
