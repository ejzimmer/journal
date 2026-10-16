import { getLocalDate } from '../../../shared/dates';
import { getProgressUpdates } from './getProgressUpdates';
import { PrintSeries } from './types';

export type ComprehensionRecord = {
  key: string;
  date: string;
  lookups: number;
  aiQuestions: number;
  understood?: number;
};

export const getComprehensionRecords = (
  series: PrintSeries,
): ComprehensionRecord[] =>
  Object.values(series.volumes ?? {})
    .flatMap(getProgressUpdates)
    .toSorted((a, b) => Temporal.Instant.compare(a.at, b.at))
    .map(({ key, at, lookups, aiQuestions, understood }) => ({
      key,
      date: getLocalDate(at),
      lookups,
      aiQuestions,
      ...(understood !== undefined && { understood }),
    }));
