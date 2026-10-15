import { readLocalDate } from './comprehensionRecords';
import { findUpToAt } from './findUpToAt';
import {
  Comprehension,
  FieldChange,
  getLanguageMediaPath,
  isPrintSeries,
  ItemUpdate,
  PrintSeries,
  Reading,
  StoredMediaByYear,
  Volume,
} from './types';

type LegacyVolume = Volume & Partial<Comprehension>;

const LEGACY_FIELDS = ['lookups', 'aiQuestions', 'understood'] as const;

const isLegacyVolume = (volume: LegacyVolume) =>
  LEGACY_FIELDS.some((field) => field in volume);

const isComprehensionUpdate = ({ changes }: ItemUpdate) =>
  LEGACY_FIELDS.some((field) => field in changes);

const measureIncrease = (change?: FieldChange) =>
  change ? Number(change.to ?? 0) - Number(change.from ?? 0) : 0;

function findPageAt(series: PrintSeries, volume: Volume, instant?: string) {
  const upTo = instant ? findUpToAt(series, instant) : series.upTo;
  if (volume.status === 'done' || (upTo && upTo.volume > volume.number)) {
    return volume.pages;
  }
  return upTo?.volume === volume.number ? upTo.page : 0;
}

function groupUpdatesByDate(volume: Volume) {
  const groups = new Map<string, ItemUpdate[]>();
  Object.values(volume.updates ?? {})
    .filter(isComprehensionUpdate)
    .toSorted((a, b) => Temporal.Instant.compare(a.at, b.at))
    .forEach((update) => {
      const date = readLocalDate(update.at);
      groups.set(date, [...(groups.get(date) ?? []), update]);
    });
  return groups;
}

function createDayReading(
  series: PrintSeries,
  volume: Volume,
  date: string,
  updates: ItemUpdate[],
): Reading {
  const lastAt = updates.at(-1)!.at;
  const understood = updates.findLast(
    ({ changes }) => changes.understood?.to !== undefined,
  )?.changes.understood.to;
  const sumIncreases = (field: 'lookups' | 'aiQuestions') =>
    Math.max(
      0,
      updates.reduce(
        (total, { changes }) => total + measureIncrease(changes[field]),
        0,
      ),
    );
  return {
    id: `migrated-${date}`,
    createdAt: lastAt,
    lookups: sumIncreases('lookups'),
    aiQuestions: sumIncreases('aiQuestions'),
    ...(understood !== undefined && { understood: Number(understood) }),
    page: findPageAt(series, volume, lastAt),
  };
}

function createRemainderReading(
  series: PrintSeries,
  volume: LegacyVolume,
  dayReadings: Reading[],
  at: string,
): Reading | undefined {
  const sum = (field: 'lookups' | 'aiQuestions') =>
    dayReadings.reduce((total, reading) => total + reading[field], 0);
  const lookups = Math.max(0, (volume.lookups ?? 0) - sum('lookups'));
  const aiQuestions = Math.max(
    0,
    (volume.aiQuestions ?? 0) - sum('aiQuestions'),
  );
  const hasUnrecordedUnderstood =
    volume.understood !== undefined &&
    dayReadings.every(({ understood }) => understood === undefined);
  if (!lookups && !aiQuestions && !hasUnrecordedUnderstood) return undefined;
  return {
    id: 'migrated-remainder',
    createdAt: at,
    lookups,
    aiQuestions,
    ...(hasUnrecordedUnderstood && { understood: volume.understood }),
    page: findPageAt(series, volume),
  };
}

function migrateVolume(
  series: PrintSeries,
  volume: LegacyVolume,
  path: string,
  at: string,
) {
  const dayReadings = [...groupUpdatesByDate(volume)].map(([date, updates]) =>
    createDayReading(series, volume, date, updates),
  );
  const remainder = createRemainderReading(series, volume, dayReadings, at);
  const readings = remainder ? [...dayReadings, remainder] : dayReadings;
  return [
    ...readings.map((reading) => [`${path}/readings/${reading.id}`, reading]),
    ...LEGACY_FIELDS.map((field) => [`${path}/${field}`, null]),
  ];
}

export function createReadingsMigration(
  storedMediaByYear: StoredMediaByYear = {},
  at: string,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(storedMediaByYear).flatMap(([year, mediaById]) =>
      Object.values(mediaById)
        .filter(isPrintSeries)
        .flatMap((series) =>
          Object.values(series.volumes ?? {})
            .filter(isLegacyVolume)
            .flatMap((volume) =>
              migrateVolume(
                series,
                volume,
                `${getLanguageMediaPath(Number(year))}/${series.id}/volumes/${volume.id}`,
                at,
              ),
            ),
        ),
    ),
  );
}
