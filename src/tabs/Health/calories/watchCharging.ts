import { WatchGlyph } from './WatchGlyph';
import { LoggedSymptom, parseSymptoms, Symptom } from './symptoms';

export const WATCH_CHARGED = 'watch-charged';

export const WATCH: Symptom = {
  id: 'watch',
  label: 'watch charged',
  colour: '#16a3a3',
  path: 'M7.5 1H12.5V5H7.5ZM7.5 15H12.5V19H7.5ZM3.8 10a6.2 6.2 0 1 0 12.4 0a6.2 6.2 0 1 0 -12.4 0Z',
  Glyph: WatchGlyph,
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
