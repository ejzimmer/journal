import {
  formatDate,
  formatDateId,
  formatDayAndMonth,
  getDateFromTimestamp,
  getDaysSince,
  getMillisecondsUntilTomorrow,
  getStartOfWeek,
  getTimestampFromDate,
  getToday,
  isAfterToday,
  isBeforeToday,
  isToday,
} from "./dates"

const atLocalTime = (
  year: number,
  monthIndex: number,
  day: number,
  hours = 0,
  minutes = 0,
) => new Date(year, monthIndex, day, hours, minutes).getTime()

describe("dates", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(atLocalTime(2026, 8, 20, 10, 0))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("getToday", () => {
    it("is the current date in the local time zone", () => {
      expect(getToday().toString()).toBe("2026-09-20")
    })
  })

  describe("getDateFromTimestamp", () => {
    describe("when the timestamp is late in the evening", () => {
      it("is the day that evening belongs to", () => {
        expect(
          getDateFromTimestamp(atLocalTime(2026, 8, 19, 23, 30)).toString(),
        ).toBe("2026-09-19")
      })
    })
  })

  describe("getTimestampFromDate", () => {
    it("is midnight at the start of that day", () => {
      const timestamp = getTimestampFromDate(
        Temporal.PlainDate.from("2026-09-20"),
      )

      expect(timestamp).toBe(atLocalTime(2026, 8, 20))
    })

    it("round trips with getDateFromTimestamp", () => {
      const date = Temporal.PlainDate.from("2026-03-07")

      expect(getDateFromTimestamp(getTimestampFromDate(date)).toString()).toBe(
        "2026-03-07",
      )
    })
  })

  describe("isToday", () => {
    it("is true just before midnight tonight", () => {
      expect(isToday(atLocalTime(2026, 8, 20, 23, 59))).toBe(true)
    })

    it("is false just after midnight this morning", () => {
      expect(isToday(atLocalTime(2026, 8, 19, 23, 59))).toBe(false)
    })
  })

  describe("isBeforeToday", () => {
    it("is true for any time yesterday", () => {
      expect(isBeforeToday(atLocalTime(2026, 8, 19, 23, 59))).toBe(true)
    })

    it("is false for earlier today", () => {
      expect(isBeforeToday(atLocalTime(2026, 8, 20, 0, 1))).toBe(false)
    })
  })

  describe("isAfterToday", () => {
    it("is true for tomorrow", () => {
      expect(isAfterToday(atLocalTime(2026, 8, 21))).toBe(true)
    })

    it("is false for later today", () => {
      expect(isAfterToday(atLocalTime(2026, 8, 20, 23, 59))).toBe(false)
    })
  })

  describe("getDaysSince", () => {
    describe("when only a few hours have passed but the date changed", () => {
      it("counts the change of date, not the hours", () => {
        expect(getDaysSince(atLocalTime(2026, 8, 19, 23, 30))).toBe(1)
      })
    })

    describe("when most of a day has passed within the same date", () => {
      it("counts no days", () => {
        expect(getDaysSince(atLocalTime(2026, 8, 20, 0, 1))).toBe(0)
      })
    })

    it("counts whole dates for longer gaps", () => {
      expect(getDaysSince(atLocalTime(2026, 8, 13, 18, 0))).toBe(7)
    })
  })

  describe("getStartOfWeek", () => {
    it("is the Monday of that week", () => {
      expect(
        getStartOfWeek(Temporal.PlainDate.from("2026-09-16")).toString(),
      ).toBe("2026-09-14")
    })

    describe("when the date is a Monday", () => {
      it("is that same day", () => {
        expect(
          getStartOfWeek(Temporal.PlainDate.from("2026-09-14")).toString(),
        ).toBe("2026-09-14")
      })
    })

    describe("when the date is a Sunday", () => {
      it("is the Monday six days earlier", () => {
        expect(
          getStartOfWeek(Temporal.PlainDate.from("2026-09-20")).toString(),
        ).toBe("2026-09-14")
      })
    })
  })

  describe("getMillisecondsUntilTomorrow", () => {
    it("reaches the next midnight", () => {
      expect(Date.now() + getMillisecondsUntilTomorrow()).toBe(
        atLocalTime(2026, 8, 21),
      )
    })
  })

  describe("formatDateId", () => {
    it("is the ISO date", () => {
      expect(formatDateId(Temporal.PlainDate.from("2026-01-05"))).toBe(
        "2026-01-05",
      )
    })
  })

  describe("formatDate", () => {
    it("splits the date into day, short month and two-digit year", () => {
      expect(formatDate(Temporal.PlainDate.from("2026-01-05"))).toEqual({
        day: 5,
        month: "Jan",
        year: "26",
      })
    })
  })

  describe("formatDayAndMonth", () => {
    it("pads a single-digit day", () => {
      expect(formatDayAndMonth(Temporal.PlainDate.from("2026-01-05"))).toBe(
        "05 Jan",
      )
    })

    describe("when the locale's short month is longer than three letters", () => {
      it("trims it to three", () => {
        expect(formatDayAndMonth(Temporal.PlainDate.from("2026-09-20"))).toBe(
          "20 Sep",
        )
      })
    })
  })
})
