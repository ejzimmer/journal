import {
  formatDate,
  formatDateId,
  formatDayAndMonth,
  formatMonthAndYear,
  getDaysSince,
  getMillisecondsUntilTomorrow,
  getDateDaysAgo,
  getDateDaysAhead,
  getDaysUntil,
  isThisWeek,
  getToday,
  getThisMonth,
  isAfterToday,
  isBeforeToday,
  isToday,
} from './dates';

const atLocalTime = (
  year: number,
  monthIndex: number,
  day: number,
  hours = 0,
  minutes = 0,
) => new Date(year, monthIndex, day, hours, minutes).getTime();

describe('dates', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(atLocalTime(2026, 8, 20, 10, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getToday', () => {
    it('is the current date in the local time zone', () => {
      expect(getToday()).toBe('2026-09-20');
    });
  });

  describe('getThisMonth', () => {
    it('is the current month in the local time zone', () => {
      expect(getThisMonth().toString()).toBe('2026-09');
    });
  });

  describe('isToday', () => {
    it('is true just before midnight tonight', () => {
      expect(isToday('2026-09-20')).toBe(true);
    });

    it('is false for yesterday', () => {
      expect(isToday('2026-09-19')).toBe(false);
    });
  });

  describe('isBeforeToday', () => {
    it('is true for yesterday', () => {
      expect(isBeforeToday('2026-09-19')).toBe(true);
    });

    it('is false for today', () => {
      expect(isBeforeToday('2026-09-20')).toBe(false);
    });
  });

  describe('isAfterToday', () => {
    it('is true for tomorrow', () => {
      expect(isAfterToday('2026-09-21')).toBe(true);
    });

    it('is false for today', () => {
      expect(isAfterToday('2026-09-20')).toBe(false);
    });
  });

  describe('getDaysSince', () => {
    it('counts one day for yesterday', () => {
      expect(getDaysSince('2026-09-19')).toBe(1);
    });

    it('counts no days for today', () => {
      expect(getDaysSince('2026-09-20')).toBe(0);
    });

    it('counts whole dates for longer gaps', () => {
      expect(getDaysSince('2026-09-13')).toBe(7);
    });
  });

  describe('isThisWeek', () => {
    it('is true for a date earlier in the same Monday-start week', () => {
      expect(isThisWeek('2026-09-16')).toBe(true);
    });

    it('is true for the Monday the week starts on', () => {
      expect(isThisWeek('2026-09-14')).toBe(true);
    });

    describe('when today is the Sunday a week ends on', () => {
      it('is false for the Monday that starts the next week', () => {
        expect(isThisWeek('2026-09-21')).toBe(false);
      });

      it('is false for the Sunday that ended the previous week', () => {
        expect(isThisWeek('2026-09-13')).toBe(false);
      });
    });
  });

  describe('getDaysUntil', () => {
    it('counts forward to a later date', () => {
      expect(getDaysUntil('2026-09-27')).toBe(7);
    });

    it('is negative for a date already past', () => {
      expect(getDaysUntil('2026-09-19')).toBe(-1);
    });

    it('is zero for today', () => {
      expect(getDaysUntil('2026-09-20')).toBe(0);
    });
  });

  describe('getDateDaysAgo', () => {
    it('counts back from today', () => {
      expect(getDateDaysAgo(1)).toBe('2026-09-19');
    });

    it('crosses a month boundary', () => {
      expect(getDateDaysAgo(20)).toBe('2026-08-31');
    });
  });

  describe('getDateDaysAhead', () => {
    it('counts forward from today', () => {
      expect(getDateDaysAhead(11)).toBe('2026-10-01');
    });
  });

  describe('getMillisecondsUntilTomorrow', () => {
    it('reaches the next midnight', () => {
      expect(Date.now() + getMillisecondsUntilTomorrow()).toBe(
        atLocalTime(2026, 8, 21),
      );
    });
  });

  describe('formatDateId', () => {
    it('is the ISO date', () => {
      expect(formatDateId(Temporal.PlainDate.from('2026-01-05'))).toBe(
        '2026-01-05',
      );
    });
  });

  describe('formatDate', () => {
    it('splits the date into day, short month and two-digit year', () => {
      expect(formatDate(Temporal.PlainDate.from('2026-01-05'))).toEqual({
        day: 5,
        month: 'Jan',
        year: '26',
      });
    });
  });

  describe('formatMonthAndYear', () => {
    it('gives the short month and the full year', () => {
      expect(formatMonthAndYear(Temporal.PlainYearMonth.from('2026-06'))).toBe(
        'Jun 2026',
      );
    });
  });

  describe('formatDayAndMonth', () => {
    it('pads a single-digit day', () => {
      expect(formatDayAndMonth('2026-01-05')).toBe('05 Jan');
    });

    describe("when the locale's short month is longer than three letters", () => {
      it('trims it to three', () => {
        expect(formatDayAndMonth('2026-09-20')).toBe('20 Sep');
      });
    });
  });
});
