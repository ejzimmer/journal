import {
  compareDates,
  formatDate,
  formatDateId,
  formatDayAndMonth,
  formatMonthAndYear,
  getDaysSince,
  getMillisecondsUntilTomorrow,
  getPlainDate,
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

  describe('getPlainDate', () => {
    describe('when the date is an ISO string', () => {
      it('is that date', () => {
        expect(getPlainDate('2026-03-07').toString()).toBe('2026-03-07');
      });
    });

    describe('when the date is a timestamp left over from before the migration', () => {
      it('is the day that timestamp falls on locally', () => {
        expect(getPlainDate(atLocalTime(2026, 8, 19, 23, 30)).toString()).toBe(
          '2026-09-19',
        );
      });
    });
  });

  describe('compareDates', () => {
    it('orders an earlier date before a later one', () => {
      expect(compareDates('2026-09-19', '2026-09-20')).toBe(-1);
      expect(compareDates('2026-09-20', '2026-09-19')).toBe(1);
      expect(compareDates('2026-09-20', '2026-09-20')).toBe(0);
    });

    describe('when one side is a timestamp and the other an ISO string', () => {
      it('compares them by calendar day', () => {
        expect(
          compareDates(atLocalTime(2026, 8, 20, 23, 30), '2026-09-20'),
        ).toBe(0);
      });
    });
  });

  describe('isToday', () => {
    it('is true just before midnight tonight', () => {
      expect(isToday('2026-09-20')).toBe(true);
    });

    it('is false for yesterday', () => {
      expect(isToday('2026-09-19')).toBe(false);
    });

    describe('when the date is a timestamp left over from before the migration', () => {
      it('still reads as today', () => {
        expect(isToday(atLocalTime(2026, 8, 20, 23, 59))).toBe(true);
      });
    });
  });

  describe('isBeforeToday', () => {
    it('is true for yesterday', () => {
      expect(isBeforeToday('2026-09-19')).toBe(true);
    });

    it('is false for today', () => {
      expect(isBeforeToday('2026-09-20')).toBe(false);
    });

    describe('when the date is a timestamp left over from before the migration', () => {
      it('is true for any time yesterday', () => {
        expect(isBeforeToday(atLocalTime(2026, 8, 19, 23, 59))).toBe(true);
      });

      it('is false for earlier today', () => {
        expect(isBeforeToday(atLocalTime(2026, 8, 20, 0, 1))).toBe(false);
      });
    });
  });

  describe('isAfterToday', () => {
    it('is true for tomorrow', () => {
      expect(isAfterToday('2026-09-21')).toBe(true);
    });

    it('is false for later today', () => {
      expect(isAfterToday(atLocalTime(2026, 8, 20, 23, 59))).toBe(false);
    });
  });

  describe('getDaysSince', () => {
    describe('when only a few hours have passed but the date changed', () => {
      it('counts the change of date, not the hours', () => {
        expect(getDaysSince(atLocalTime(2026, 8, 19, 23, 30))).toBe(1);
      });
    });

    describe('when most of a day has passed within the same date', () => {
      it('counts no days', () => {
        expect(getDaysSince(atLocalTime(2026, 8, 20, 0, 1))).toBe(0);
      });
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

    describe('when the date is a timestamp left over from before the migration', () => {
      it('formats the day it falls on', () => {
        expect(formatDayAndMonth(atLocalTime(2026, 0, 5, 9, 0))).toBe('05 Jan');
      });
    });
  });
});
