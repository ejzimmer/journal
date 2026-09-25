import { getPlainDate, getDateDaysAgo } from './dates';

export const getLegacyTimestampDaysAgo = (days: number) =>
  getPlainDate(getDateDaysAgo(days)).toZonedDateTime(Temporal.Now.timeZoneId())
    .epochMilliseconds;
