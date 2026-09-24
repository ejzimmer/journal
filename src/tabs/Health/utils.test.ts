import { setupDays, STARTING_BALANCE } from './utils';
import { DayData } from '../../shared/types';

describe('setupDays', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-10'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("carries the previous day's balance forward over a day with no recorded data", () => {
    const dayData: Record<string, DayData> = {
      '2026-01-01': { id: '2026-01-01', consumed: 2000, expended: 2000 },
      '2026-01-02': { id: '2026-01-02', consumed: 1800, expended: 2200 },
      '2026-01-04': { id: '2026-01-04', consumed: 2000, expended: 1800 },
    };

    const days = setupDays(dayData);

    expect(days[0].balance).toBe(STARTING_BALANCE);
    expect(days[1].balance).toBe(STARTING_BALANCE - 400);

    expect(days[2].diff).toBeUndefined();
    expect(days[2].balance).toBe(STARTING_BALANCE - 400);

    expect(days[3].balance).toBe(STARTING_BALANCE - 400 + 200);
  });
});
