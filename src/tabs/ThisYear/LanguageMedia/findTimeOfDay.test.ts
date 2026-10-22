import { findTimeOfDay } from './findTimeOfDay';

describe('findTimeOfDay', () => {
  it.each([
    [0, 'night'],
    [4.9, 'night'],
    [5, 'dawn'],
    [7, 'day'],
    [17.9, 'day'],
    [18, 'dusk'],
    [20, 'night'],
    [23.9, 'night'],
  ])('calls %d o’clock %s', (hour, timeOfDay) => {
    expect(findTimeOfDay(hour)).toBe(timeOfDay);
  });
});
