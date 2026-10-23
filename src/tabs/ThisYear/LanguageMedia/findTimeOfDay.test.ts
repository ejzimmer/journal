import { findTimeOfDay } from './findTimeOfDay';

const sydney = { latitude: -33.87, longitude: 151.21 };

describe('findTimeOfDay', () => {
  describe('in Sydney on 23 October 2026', () => {
    it.each([
      ['3am', '2026-10-22T16:00:00Z', 'night'],
      ['just after sunrise', '2026-10-22T19:10:00Z', 'dawn'],
      ['noon', '2026-10-23T01:00:00Z', 'day'],
      ['just before sunset', '2026-10-23T08:00:00Z', 'dusk'],
      ['10pm', '2026-10-23T11:00:00Z', 'night'],
    ])('calls %s %s', (_, time, timeOfDay) => {
      expect(findTimeOfDay(Date.parse(time), sydney)).toBe(timeOfDay);
    });
  });
});
