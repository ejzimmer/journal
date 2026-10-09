import { getItemsByNumber } from './lists';
import { FieldChange, ItemUpdate, PrintSeries } from './types';

export type ComprehensionRecord = {
  date: string;
  lookups: number;
  aiQuestions: number;
  understood?: number;
};

const readLocalDate = (instant: string) =>
  Temporal.Instant.from(instant)
    .toZonedDateTimeISO(Temporal.Now.timeZoneId())
    .toPlainDate()
    .toString();

const measureIncrease = (change?: FieldChange) =>
  change ? Number(change.to ?? 0) - Number(change.from ?? 0) : 0;

const isComprehensionUpdate = ({ changes }: ItemUpdate) =>
  'lookups' in changes || 'aiQuestions' in changes || 'understood' in changes;

export function getComprehensionRecords(series: PrintSeries) {
  const updates = getItemsByNumber(series.volumes)
    .flatMap(({ updates }) => Object.values(updates ?? {}))
    .filter(isComprehensionUpdate)
    .toSorted((a, b) => Temporal.Instant.compare(a.at, b.at));

  const recordsByDate = new Map<string, ComprehensionRecord>();
  updates.forEach(({ at, changes }) => {
    const date = readLocalDate(at);
    const record = recordsByDate.get(date) ?? {
      date,
      lookups: 0,
      aiQuestions: 0,
    };
    recordsByDate.set(date, {
      ...record,
      lookups: record.lookups + measureIncrease(changes.lookups),
      aiQuestions: record.aiQuestions + measureIncrease(changes.aiQuestions),
      understood:
        changes.understood?.to === undefined
          ? record.understood
          : Number(changes.understood.to),
    });
  });

  return [...recordsByDate.values()];
}
