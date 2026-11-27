import { DAILY_PATH } from '../../../types';
import { createLegacyTrackerUpdates } from './legacyTrackerMigration';

describe('replacing the old period trackers', () => {
  describe('when a day has old period trackers', () => {
    it('swaps them for period flow and cramps levels and keeps the rest', () => {
      expect(
        createLegacyTrackerUpdates({
          '2026-10-07': {
            id: '2026-10-07',
            consumed: 1800,
            trackers: ['lightFlow', 'watch-charged', 'ovaryPain'],
          },
        }),
      ).toEqual({
        [`${DAILY_PATH}/2026-10-07/trackers`]: [
          'flow-1',
          'watch-charged',
          'cramps-2',
        ],
      });
    });

    it('turns heavy flow into period flow 2', () => {
      expect(
        createLegacyTrackerUpdates({
          '2026-10-08': { id: '2026-10-08', trackers: ['heavyFlow'] },
        }),
      ).toEqual({ [`${DAILY_PATH}/2026-10-08/trackers`]: ['flow-2'] });
    });

    describe('and also logs the same level with the symptom picker', () => {
      it('keeps one copy of it', () => {
        expect(
          createLegacyTrackerUpdates({
            '2026-10-09': {
              id: '2026-10-09',
              trackers: ['flow-2', 'heavyFlow'],
            },
          }),
        ).toEqual({ [`${DAILY_PATH}/2026-10-09/trackers`]: ['flow-2'] });
      });
    });
  });

  describe('when every day uses the symptom picker trackers', () => {
    it('changes nothing', () => {
      expect(
        createLegacyTrackerUpdates({
          '2026-11-20': { id: '2026-11-20', trackers: ['flow-3', 'cough-1'] },
          '2026-11-21': { id: '2026-11-21', consumed: 1700 },
        }),
      ).toEqual({});
    });
  });
});
