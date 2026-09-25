import { getToday } from './dates';

export const getDateDaysAgo = (days: number) =>
  getToday().subtract({ days }).toString();

export const getDateDaysAhead = (days: number) =>
  getToday().add({ days }).toString();

export const getLegacyTimestampDaysAgo = (days: number) =>
  getToday().subtract({ days }).toZonedDateTime(Temporal.Now.timeZoneId())
    .epochMilliseconds;
