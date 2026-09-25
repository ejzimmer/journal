const monthFormatter = Intl.DateTimeFormat('en-AU', { month: 'short' });

export type StoredDate = number | string;

export const getToday = () => Temporal.Now.plainDateISO();

export const getPlainDate = (date: StoredDate) =>
  typeof date === 'number'
    ? Temporal.Instant.fromEpochMilliseconds(date)
        .toZonedDateTimeISO(Temporal.Now.timeZoneId())
        .toPlainDate()
    : Temporal.PlainDate.from(date);

export const compareDates = (a: StoredDate, b: StoredDate) =>
  Temporal.PlainDate.compare(getPlainDate(a), getPlainDate(b));

export const isToday = (date: StoredDate) =>
  getPlainDate(date).equals(getToday());

export const isBeforeToday = (date: StoredDate) =>
  Temporal.PlainDate.compare(getPlainDate(date), getToday()) < 0;

export const isAfterToday = (date: StoredDate) =>
  Temporal.PlainDate.compare(getPlainDate(date), getToday()) > 0;

export const getDaysSince = (date: StoredDate) =>
  getToday().since(getPlainDate(date), { largestUnit: 'day' }).days;

export const getStartOfWeek = (date: Temporal.PlainDate) =>
  date.subtract({ days: date.dayOfWeek - 1 });

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

export const formatDayAndMonth = (date: StoredDate) => {
  const plainDate = getPlainDate(date);

  return `${plainDate.day.toString().padStart(2, '0')} ${formatMonth(plainDate)}`;
};
