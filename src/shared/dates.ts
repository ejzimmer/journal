const monthFormatter = Intl.DateTimeFormat('en-AU', { month: 'short' });

export type StoredDate = number | string;

const getTodaysPlainDate = () => Temporal.Now.plainDateISO();

const getStartOfWeek = (date: Temporal.PlainDate) =>
  date.subtract({ days: date.dayOfWeek - 1 });

export const getToday = () => getTodaysPlainDate().toString();

export const getThisMonth = () => getTodaysPlainDate().toPlainYearMonth();

export const getDateDaysAgo = (days: number) =>
  getTodaysPlainDate().subtract({ days }).toString();

export const getDateDaysAhead = (days: number) =>
  getTodaysPlainDate().add({ days }).toString();

export const getPlainDate = (date: StoredDate) =>
  typeof date === 'number'
    ? Temporal.Instant.fromEpochMilliseconds(date)
        .toZonedDateTimeISO(Temporal.Now.timeZoneId())
        .toPlainDate()
    : Temporal.PlainDate.from(date);

export const compareDates = (a: StoredDate, b: StoredDate) =>
  Temporal.PlainDate.compare(getPlainDate(a), getPlainDate(b));

export const isToday = (date: StoredDate) =>
  compareDates(date, getToday()) === 0;

export const isBeforeToday = (date: StoredDate) =>
  compareDates(date, getToday()) < 0;

export const isAfterToday = (date: StoredDate) =>
  compareDates(date, getToday()) > 0;

export const isThisWeek = (date: StoredDate) =>
  getStartOfWeek(getPlainDate(date)).equals(
    getStartOfWeek(getTodaysPlainDate()),
  );

export const getDaysSince = (date: StoredDate) =>
  getTodaysPlainDate().since(getPlainDate(date), { largestUnit: 'day' }).days;

export const getDaysUntil = (date: StoredDate) =>
  getPlainDate(date).since(getTodaysPlainDate(), { largestUnit: 'day' }).days;

export const getMillisecondsUntilTomorrow = () => {
  const now = Temporal.Now.zonedDateTimeISO();

  return (
    now.startOfDay().add({ days: 1 }).epochMilliseconds - now.epochMilliseconds
  );
};

export const formatDateId = (date: Temporal.PlainDate) => date.toString();

const formatMonth = (date: Temporal.PlainDate) =>
  monthFormatter.format(date).substring(0, 3);

export const formatDate = (date: Temporal.PlainDate) => ({
  day: date.day,
  month: formatMonth(date),
  year: date.year.toString().substring(2),
});

export const formatMonthAndYear = (yearMonth: Temporal.PlainYearMonth) =>
  `${formatMonth(yearMonth.toPlainDate({ day: 1 }))} ${yearMonth.year}`;

export const formatDayAndMonth = (date: StoredDate) => {
  const plainDate = getPlainDate(date);

  return `${plainDate.day.toString().padStart(2, '0')} ${formatMonth(plainDate)}`;
};
