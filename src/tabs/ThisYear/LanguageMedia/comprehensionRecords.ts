import { getItemsByNumber } from './lists';
import { getReadings } from './getReadings';
import { PrintSeries } from './types';

export type ComprehensionRecord = {
  date: string;
  lookups: number;
  aiQuestions: number;
  understood?: number;
};

export const readLocalDate = (instant: string) =>
  Temporal.Instant.from(instant)
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainDate()
    .toString();

export function getComprehensionRecords(series: PrintSeries) {
  const readings = getItemsByNumber(series.volumes)
    .flatMap(getReadings)
    .toSorted((a, b) => Temporal.Instant.compare(a.createdAt, b.createdAt));

  const recordsByDate = new Map<string, ComprehensionRecord>();
  readings.forEach(({ createdAt, lookups, aiQuestions, understood }) => {
    const date = readLocalDate(createdAt);
    const record = recordsByDate.get(date) ?? {
      date,
      lookups: 0,
      aiQuestions: 0,
    };
    recordsByDate.set(date, {
      ...record,
      lookups: record.lookups + lookups,
      aiQuestions: record.aiQuestions + aiQuestions,
      understood: understood ?? record.understood,
    });
  });

  return [...recordsByDate.values()];
}
