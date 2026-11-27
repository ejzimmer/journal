import { DAILY_PATH, DayData } from '../../../types';

// Days logged before the symptom picker stored period flow and cramps as
// these keys.
const LEGACY_TRACKERS: Record<string, string> = {
  lightFlow: 'flow-1',
  heavyFlow: 'flow-2',
  ovaryPain: 'cramps-2',
};

const hasLegacyTracker = (day: DayData) =>
  (day.trackers ?? []).some((tracker) => tracker in LEGACY_TRACKERS);

const replaceLegacyTrackers = (trackers: string[]) => [
  ...new Set(trackers.map((tracker) => LEGACY_TRACKERS[tracker] ?? tracker)),
];

export function createLegacyTrackerUpdates(
  days: Record<string, DayData> = {},
): Record<string, string[]> {
  return Object.fromEntries(
    Object.values(days)
      .filter(hasLegacyTracker)
      .map((day) => [
        `${DAILY_PATH}/${day.id}/trackers`,
        replaceLegacyTrackers(day.trackers ?? []),
      ]),
  );
}
