import { getItemsByNumber } from './lists';
import { getProgressUpdates } from './getProgressUpdates';
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
  const updates = getItemsByNumber(series.volumes)
    .flatMap(getProgressUpdates)
    .toSorted((a, b) => Temporal.Instant.compare(a.at, b.at));

  const recordsByDate = new Map<string, ComprehensionRecord>();
  updates.forEach(({ at, lookups, aiQuestions, understood }) => {
    const date = readLocalDate(at);
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
