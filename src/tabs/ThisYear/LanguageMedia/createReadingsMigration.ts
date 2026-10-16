import { readLocalDate } from './comprehensionRecords';
import { findUpToAt } from './findUpToAt';
import { IMPORT_UPDATE_KEY } from './createImportUpdateRekey';
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
type MigratedReading = Omit<Reading, 'id'>;

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

const findEndOfDay = (date: string) =>
  Temporal.PlainDate.from(date)
    .add({ days: 1 })
    .toZonedDateTime(Temporal.Now.timeZoneId())
    .toInstant()
    .subtract({ nanoseconds: 1 })
    .toString();

function findPageSaves(series: PrintSeries, volume: Volume) {
  return Object.entries(series.updates ?? {})
    .filter(
      ([key, { changes }]) =>
        key !== IMPORT_UPDATE_KEY &&
        (changes.upTo?.to as PrintSeries['upTo'])?.volume === volume.number,
    )
    .map(([, update]) => update);
}

function groupUpdatesByDate(series: PrintSeries, volume: Volume) {
  const groups = new Map<string, ItemUpdate[]>();
  [
    ...Object.values(volume.updates ?? {}).filter(isComprehensionUpdate),
    ...findPageSaves(series, volume),
  ]
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
): MigratedReading {
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
    createdAt: lastAt,
    lookups: sumIncreases('lookups'),
    aiQuestions: sumIncreases('aiQuestions'),
    ...(understood !== undefined && { understood: Number(understood) }),
    page: findPageAt(series, volume, findEndOfDay(date)),
  };
}

function createRemainderReading(
  series: PrintSeries,
  volume: LegacyVolume,
  dayReadings: MigratedReading[],
  at: string,
): MigratedReading | undefined {
  const sum = (field: 'lookups' | 'aiQuestions') =>
    dayReadings.reduce((total, reading) => total + reading[field], 0);
  const lookups = Math.max(0, (volume.lookups ?? 0) - sum('lookups'));
  const aiQuestions = Math.max(
    0,
    (volume.aiQuestions ?? 0) - sum('aiQuestions'),
  );
  const hasOnlyUnderstood =
    volume.understood !== undefined && dayReadings.length === 0;
  if (!lookups && !aiQuestions && !hasOnlyUnderstood) return undefined;
  return {
    createdAt: at,
    lookups,
    aiQuestions,
    page: findPageAt(series, volume),
  };
}

function fillUnderstood(readings: MigratedReading[], fallback?: number) {
  const firstKnown =
    readings.find(({ understood }) => understood !== undefined)?.understood ??
    fallback;
  let lastKnown = firstKnown;
  return readings.map((reading) => {
    lastKnown = reading.understood ?? lastKnown;
    return lastKnown === undefined
      ? reading
      : { ...reading, understood: lastKnown };
  });
}

function migrateVolume(
  series: PrintSeries,
  volume: LegacyVolume,
  path: string,
  at: string,
  createId: () => string,
) {
  const dayReadings = [...groupUpdatesByDate(series, volume)].map(
    ([date, updates]) => createDayReading(series, volume, date, updates),
  );
  const remainder = createRemainderReading(series, volume, dayReadings, at);
  const readings = fillUnderstood(
    remainder ? [...dayReadings, remainder] : dayReadings,
    volume.understood,
  );
  return [
    ...readings.map((reading) => {
      const id = createId();
      return [`${path}/readings/${id}`, { id, ...reading }];
    }),
    ...LEGACY_FIELDS.map((field) => [`${path}/${field}`, null]),
  ];
}

export function createReadingsMigration(
  storedMediaByYear: StoredMediaByYear = {},
  at: string,
  createId: () => string,
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
                createId,
              ),
            ),
        ),
    ),
  );
}
