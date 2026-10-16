import { getLocalDate } from '../../../shared/dates';
import { getProgressUpdates } from './getProgressUpdates';
import { PrintSeries } from './types';

export type ComprehensionRecord = {
  date: string;
  lookups: number;
  aiQuestions: number;
  understood?: number;
};

export function getComprehensionRecords(series: PrintSeries) {
  const updates = Object.values(series.volumes ?? {})
    .flatMap(getProgressUpdates)
    .toSorted((a, b) => Temporal.Instant.compare(a.at, b.at));

  const totalsByDate = new Map<string, ComprehensionRecord>();
  updates.forEach(({ at, lookups, aiQuestions, understood }) => {
    const date = getLocalDate(at);
    const totals = totalsByDate.get(date) ?? {
      date,
      lookups: 0,
      aiQuestions: 0,
    };
    totalsByDate.set(date, {
      ...totals,
      lookups: totals.lookups + lookups,
      aiQuestions: totals.aiQuestions + aiQuestions,
      understood: understood ?? totals.understood,
    });
  });

  return [...totalsByDate.values()];
}
