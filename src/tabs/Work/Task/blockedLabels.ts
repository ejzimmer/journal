import { formatDayAndMonth, getToday } from '../../../shared/dates';
import { Blocked, Blocker } from '../types';

export const BLOCKER_LABELS: Record<Blocker, string> = {
  merge_queue: 'Blocked on merge queue',
  build: 'Blocked on build',
  human: 'Blocked on human',
  time: 'Blocked until a time',
};

export const formatBlockedUntil = (until: string) => {
  const dateTime = Temporal.PlainDateTime.from(until);
  const date = dateTime.toPlainDate().toString();
  const time = dateTime.toPlainTime().toString({ smallestUnit: 'minute' });

  return date === getToday() ? time : `${formatDayAndMonth(date)} ${time}`;
};

export const describeBlocked = (blocked: Blocked) =>
  blocked.on === 'time'
    ? `Blocked until ${formatBlockedUntil(blocked.until)}`
    : BLOCKER_LABELS[blocked.on];
