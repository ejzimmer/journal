import { WatchIcon } from './WatchIcon';
import { LoggedSymptom, parseSymptoms, Symptom } from './symptoms';

export const WATCH_CHARGED = 'watch-charged';

export const WATCH: Symptom = {
  id: 'watch',
  label: 'watch charged',
  colour: '#16a3a3',
  Icon: WatchIcon,
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
    ? [{ symptom: WATCH, magnitude: 1 }, ...symptoms]
    : symptoms;
}
