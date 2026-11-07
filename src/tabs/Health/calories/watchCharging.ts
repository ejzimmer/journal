import { LoggedSymptom, parseSymptoms, Symptom } from './symptoms';

export const WATCH_CHARGED = 'watch-charged';

export const WATCH: Symptom = {
  id: 'watch',
  label: 'watch charged',
  colour: '#16a3a3',
  path: 'M7 1H13V4H7ZM6 4.5H14A2 2 0 0 1 16 6.5V13.5A2 2 0 0 1 14 15.5H6A2 2 0 0 1 4 13.5V6.5A2 2 0 0 1 6 4.5ZM7 16H13V19H7Z',
  unlevelled: true,
};

export function isWatchCharged(trackers: string[] = []) {
  return trackers.includes(WATCH_CHARGED);
}

export function setWatchCharged(trackers: string[], charged: boolean) {
  const others = trackers.filter((tracker) => tracker !== WATCH_CHARGED);
  return charged ? [...others, WATCH_CHARGED] : others;
}

export function listDayIcons(trackers: string[] = []): LoggedSymptom[] {
  const symptoms = parseSymptoms(trackers);
  return isWatchCharged(trackers)
    ? [...symptoms, { symptom: WATCH, magnitude: 1 }]
    : symptoms;
}
