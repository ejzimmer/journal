import { getLocalDate } from '../../../shared/dates';
import { findUpToAt } from './findUpToAt';
import { IMPORT_UPDATE_KEY } from './createImportUpdateRekey';
import {
  FieldChange,
  getLegacyUpdates,
  isLegacyUpdate,
  LegacyUpdate,
  LegacyUpdates,
} from './legacyUpdates';
import {
  Comprehension,
  getLanguageMediaPath,
  isPrintSeries,
  PrintSeries,
  ProgressUpdate,
  StoredMediaByYear,
  Volume,
} from './types';

type LegacyVolume = Omit<Volume, 'updates'> &
  Partial<Comprehension> &
  LegacyUpdates;
type LegacySeries = Omit<PrintSeries, 'volumes' | 'updates'> &
  LegacyUpdates & { volumes?: Record<string, LegacyVolume> };

const LEGACY_FIELDS = ['lookups', 'aiQuestions', 'understood'] as const;

const hasLegacyFields = (volume: LegacyVolume) =>
  LEGACY_FIELDS.some((field) => field in volume);

const hasLegacyUpdates = (item: LegacyUpdates) =>
  getLegacyUpdates(item).length > 0;

const isComprehensionUpdate = ({ changes }: LegacyUpdate) =>
  LEGACY_FIELDS.some((field) => field in changes);

const measureIncrease = (change?: FieldChange) =>
  change ? Number(change.to ?? 0) - Number(change.from ?? 0) : 0;

function findPageAt(
  series: LegacySeries,
  volume: LegacyVolume,
  instant?: string,
) {
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

function findPageSaves(series: LegacySeries, volume: LegacyVolume) {
  return Object.entries(series.updates ?? {})
    .filter(
      (entry): entry is [string, LegacyUpdate] =>
        entry[0] !== IMPORT_UPDATE_KEY && isLegacyUpdate(entry[1]),
    )
    .filter(
      ([, { changes }]) =>
        (changes.upTo?.to as PrintSeries['upTo'])?.volume === volume.number,
    )
    .map(([, update]) => update);
}

function groupUpdatesByDate(series: LegacySeries, volume: LegacyVolume) {
  const groups = new Map<string, LegacyUpdate[]>();
  [
    ...getLegacyUpdates(volume).filter(isComprehensionUpdate),
    ...findPageSaves(series, volume),
  ]
    .toSorted((a, b) => Temporal.Instant.compare(a.at, b.at))
    .forEach((update) => {
      const date = getLocalDate(update.at);
      groups.set(date, [...(groups.get(date) ?? []), update]);
    });
  return groups;
}

function createDayUpdate(
  series: LegacySeries,
  volume: LegacyVolume,
  date: string,
  updates: LegacyUpdate[],
): ProgressUpdate {
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
    at: lastAt,
    lookups: sumIncreases('lookups'),
    aiQuestions: sumIncreases('aiQuestions'),
    ...(understood !== undefined && { understood: Number(understood) }),
    page: findPageAt(series, volume, findEndOfDay(date)),
  };
}

function createRemainderUpdate(
  series: LegacySeries,
  volume: LegacyVolume,
  dayUpdates: ProgressUpdate[],
  at: string,
): ProgressUpdate | undefined {
  const sum = (field: 'lookups' | 'aiQuestions') =>
    dayUpdates.reduce((total, update) => total + update[field], 0);
  const lookups = Math.max(0, (volume.lookups ?? 0) - sum('lookups'));
  const aiQuestions = Math.max(
    0,
    (volume.aiQuestions ?? 0) - sum('aiQuestions'),
  );
  const hasOnlyUnderstood =
    volume.understood !== undefined && dayUpdates.length === 0;
  if (!lookups && !aiQuestions && !hasOnlyUnderstood) return undefined;
  return {
    at,
    lookups,
    aiQuestions,
    page: findPageAt(series, volume),
  };
}

function fillUnderstood(updates: ProgressUpdate[], fallback?: number) {
  const firstKnown =
    updates.find(({ understood }) => understood !== undefined)?.understood ??
    fallback;
  let lastKnown = firstKnown;
  return updates.map((update) => {
    lastKnown = update.understood ?? lastKnown;
    return lastKnown === undefined
      ? update
      : { ...update, understood: lastKnown };
  });
}

function migrateVolume(
  series: LegacySeries,
  volume: LegacyVolume,
  path: string,
  at: string,
  createId: () => string,
) {
  const dayUpdates = [...groupUpdatesByDate(series, volume)].map(
    ([date, updates]) => createDayUpdate(series, volume, date, updates),
  );
  const remainder = createRemainderUpdate(series, volume, dayUpdates, at);
  const migrated = fillUnderstood(
    remainder ? [...dayUpdates, remainder] : dayUpdates,
    volume.understood,
  );
  const kept = Object.entries(volume.updates ?? {}).filter(
    ([, update]) => !isLegacyUpdate(update),
  );
  const updates = [
    ...kept,
    ...migrated.map((update) => [createId(), update] as const),
  ];
  return [
    [`${path}/updates`, updates.length ? Object.fromEntries(updates) : null],
    ...LEGACY_FIELDS.map((field) => [`${path}/${field}`, null]),
  ];
}

function migrateSeries(
  series: LegacySeries,
  path: string,
  at: string,
  createId: () => string,
) {
  const isLegacySeries = hasLegacyUpdates(series);
  return [
    ...Object.values(series.volumes ?? {})
      .filter(
        (volume) =>
          isLegacySeries || hasLegacyFields(volume) || hasLegacyUpdates(volume),
      )
      .flatMap((volume) =>
        migrateVolume(
          series,
          volume,
          `${path}/volumes/${volume.id}`,
          at,
          createId,
        ),
      ),
    ...(isLegacySeries ? [[`${path}/updates`, null]] : []),
  ];
}

export function createProgressUpdateMigration(
  storedMediaByYear: StoredMediaByYear = {},
  at: string,
  createId: () => string,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(storedMediaByYear).flatMap(([year, mediaById]) =>
      Object.values(mediaById)
        .filter(isPrintSeries)
        .flatMap((series) =>
          migrateSeries(
            series as LegacySeries,
            `${getLanguageMediaPath(Number(year))}/${series.id}`,
            at,
            createId,
          ),
        ),
    ),
  );
}
