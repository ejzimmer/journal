import {
  HEAVY_FLOW,
  LIGHT_FLOW,
  OVARY_PAIN,
} from '../../tabs/Health/calories/PeriodIcons';
import { WORK_KEY } from '../../tabs/Work/types';
import { CLASSES_PATH, DAILY_PATH, WEEKLY_KEY } from '../types';
import { getAtPath, Tree } from './pathTree';

export const V2_ROOT = 'v2';

type Reshape = {
  v1Pattern: string[];
  v2Pattern: string[];
  convertToV2: (value: unknown) => unknown;
  convertToV1: (value: unknown) => unknown;
};

type Direction = 'toV2' | 'toV1';

const PERIOD_FIELDS: Record<string, string> = {
  [LIGHT_FLOW]: 'lightFlow',
  [HEAVY_FLOW]: 'heavyFlow',
  [OVARY_PAIN]: 'ovaryPain',
};

const RESHAPES: Reshape[] = [
  {
    v1Pattern: splitPath(`${WEEKLY_KEY}/*/completed`),
    v2Pattern: splitPath(`${WEEKLY_KEY}/*/completed`),
    convertToV2: convertTicksToV2,
    convertToV1: convertTicksToV1,
  },
  {
    v1Pattern: splitPath(`${DAILY_PATH}/*/trackers`),
    v2Pattern: splitPath(`${DAILY_PATH}/*/period`),
    convertToV2: convertTrackersToPeriod,
    convertToV1: convertPeriodToTrackers,
  },
  {
    v1Pattern: splitPath(`${CLASSES_PATH}/*/blocks`),
    v2Pattern: splitPath(`${CLASSES_PATH}/*/blocks`),
    convertToV2: convertBlocksToV2,
    convertToV1: convertBlocksToV1,
  },
  {
    v1Pattern: splitPath(`${WORK_KEY}/*/labelIds`),
    v2Pattern: splitPath(`${WORK_KEY}/*/labelIds`),
    convertToV2: convertLabelIdsToV2,
    convertToV1: convertLabelIdsToV1,
  },
  {
    v1Pattern: splitPath(`${WORK_KEY}/*/items/*/labelIds`),
    v2Pattern: splitPath(`${WORK_KEY}/*/items/*/labelIds`),
    convertToV2: convertLabelIdsToV2,
    convertToV1: convertLabelIdsToV1,
  },
];

export function convertPathToV2(v1Path: string): string {
  const segments = splitPath(v1Path);
  RESHAPES.forEach(({ v1Pattern, v2Pattern }) => {
    if (patternCoversPath(v1Pattern, segments)) {
      const index = v1Pattern.length - 1;
      segments[index] = v2Pattern[index];
    }
  });
  return segments.join('/');
}

export function findReshapedAncestor(v1Path: string): string | undefined {
  const segments = splitPath(v1Path);
  const reshape = RESHAPES.find(({ v1Pattern }) =>
    patternCoversPath(v1Pattern, segments),
  );
  return reshape && segments.slice(0, reshape.v1Pattern.length).join('/');
}

export function convertTreeToV2(v1Path: string, value: unknown): unknown {
  return reshapeTree(splitPath(v1Path), value, 'toV2');
}

export function convertTreeToV1(v2Path: string, value: unknown): unknown {
  return reshapeTree(splitPath(v2Path), value, 'toV1');
}

export function convertUpdatesToV2(
  updates: Record<string, unknown>,
  readV1Path: (path: string) => unknown,
): Record<string, unknown> {
  const v2Updates: Record<string, unknown> = {};
  Object.entries(updates).forEach(([path, value]) => {
    const reshapedAncestor = findReshapedAncestor(path);
    const v1Path = reshapedAncestor ?? path;
    const v1Value = reshapedAncestor ? readV1Path(reshapedAncestor) : value;
    v2Updates[`${V2_ROOT}/${convertPathToV2(v1Path)}`] =
      convertTreeToV2(v1Path, v1Value) ?? null;
  });
  return v2Updates;
}

export function findV2ReadPath(v1Key: string): string {
  return `${V2_ROOT}/${convertPathToV2(findReshapedAncestor(v1Key) ?? v1Key)}`;
}

export function convertReadValueToV1(v1Key: string, v2Value: unknown): unknown {
  const readKey = findReshapedAncestor(v1Key) ?? v1Key;
  const value = convertTreeToV1(convertPathToV2(readKey), v2Value);
  return readKey === v1Key
    ? value
    : getAtPath(value as Tree, v1Key.slice(readKey.length + 1));
}

export function listVersionDifferences(root: Tree): string[] {
  const { [V2_ROOT]: v2 = {}, ...v1 } = root;
  return listDifferences(convertTreeToV2('', v1), v2);
}

export function listDifferences(
  expected: unknown,
  actual: unknown,
  path = '',
): string[] {
  if (isPlainObject(expected) && isPlainObject(actual)) {
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    return [...keys].flatMap((key) =>
      listDifferences(
        expected[key],
        actual[key],
        path ? `${path}/${key}` : key,
      ),
    );
  }
  return JSON.stringify(expected) === JSON.stringify(actual) ? [] : [path];
}

function reshapeTree(
  segments: string[],
  value: unknown,
  direction: Direction,
): unknown {
  const reshape = findReshapeAt(segments, direction);
  if (reshape) {
    return direction === 'toV2'
      ? reshape.convertToV2(value)
      : reshape.convertToV1(value);
  }

  if (!isPlainObject(value) || !hasReshapeBelow(segments, direction)) {
    return value;
  }

  const entries = Object.entries(value)
    .map(([key, child]) => {
      const childSegments = [...segments, key];
      return [
        renameKey(childSegments, direction),
        reshapeTree(childSegments, child, direction),
      ] as const;
    })
    .filter(([, child]) => child !== undefined);
  return Object.fromEntries(entries);
}

function findReshapeAt(
  segments: string[],
  direction: Direction,
): Reshape | undefined {
  return RESHAPES.find((reshape) => {
    const pattern = selectPattern(reshape, direction);
    return (
      pattern.length === segments.length && patternCoversPath(pattern, segments)
    );
  });
}

function renameKey(segments: string[], direction: Direction): string {
  const reshape = findReshapeAt(segments, direction);
  const key = segments[segments.length - 1];
  if (!reshape) return key;
  return direction === 'toV2'
    ? reshape.v2Pattern[segments.length - 1]
    : reshape.v1Pattern[segments.length - 1];
}

function hasReshapeBelow(segments: string[], direction: Direction): boolean {
  return RESHAPES.some((reshape) => {
    const pattern = selectPattern(reshape, direction);
    return (
      pattern.length > segments.length &&
      patternCoversPath(pattern.slice(0, segments.length), segments)
    );
  });
}

function selectPattern(reshape: Reshape, direction: Direction): string[] {
  return direction === 'toV2' ? reshape.v1Pattern : reshape.v2Pattern;
}

function patternCoversPath(pattern: string[], segments: string[]): boolean {
  return (
    segments.length >= pattern.length &&
    pattern.every((part, index) => part === '*' || part === segments[index])
  );
}

function splitPath(path: string): string[] {
  return path ? path.split('/') : [];
}

function isPlainObject(value: unknown): value is Tree {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function listEntries(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.filter((entry) => entry != null);
  if (isPlainObject(value)) return Object.values(value);
  return [];
}

function createMapOrNothing(entries: [string, unknown][]): Tree | undefined {
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

function createListOrNothing<T>(list: T[]): T[] | undefined {
  return list.length > 0 ? list : undefined;
}

function sortEntriesByKey(value: unknown): [string, unknown][] {
  if (!isPlainObject(value)) return [];
  return Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1));
}

function createTickId(index: number): string {
  return `t${String(index).padStart(4, '0')}`;
}

function convertTicksToV2(value: unknown): unknown {
  return createMapOrNothing(
    listEntries(value).map((date, index) => [createTickId(index), date]),
  );
}

function convertTicksToV1(value: unknown): unknown {
  return createListOrNothing(sortEntriesByKey(value).map(([, date]) => date));
}

function convertTrackersToPeriod(value: unknown): unknown {
  return createMapOrNothing(
    listEntries(value).map((tracker) => [
      PERIOD_FIELDS[String(tracker)] ?? String(tracker),
      true,
    ]),
  );
}

function convertPeriodToTrackers(value: unknown): unknown {
  if (!isPlainObject(value)) return undefined;
  const trackersByField = Object.fromEntries(
    Object.entries(PERIOD_FIELDS).map(([tracker, field]) => [field, tracker]),
  );
  const fields = [
    ...Object.values(PERIOD_FIELDS),
    ...Object.keys(value).filter((field) => !(field in trackersByField)),
  ];
  return createListOrNothing(
    fields
      .filter((field) => value[field] === true)
      .map((field) => trackersByField[field] ?? field),
  );
}

function convertBlocksToV2(value: unknown): unknown {
  return createMapOrNothing(
    listEntries(value).map((block, position) => {
      const { completed, ...rest } = block as Tree;
      const sessions = createMapOrNothing(
        listEntries(completed).map((session) => [`s${session}`, true]),
      );
      return [
        rest.id ? String(rest.id) : `b${position}`,
        { ...rest, position, ...(sessions && { completed: sessions }) },
      ];
    }),
  );
}

function convertBlocksToV1(value: unknown): unknown {
  if (!isPlainObject(value)) return undefined;
  const blocks = Object.values(value)
    .filter(isPlainObject)
    .sort((a, b) => Number(a.position) - Number(b.position))
    .map(({ position, completed, ...rest }) => {
      const sessions = createListOrNothing(
        Object.keys(isPlainObject(completed) ? completed : {})
          .map((key) => Number(key.slice(1)))
          .sort((a, b) => a - b),
      );
      return { ...rest, ...(sessions && { completed: sessions }) };
    });
  return createListOrNothing(blocks);
}

function convertLabelIdsToV2(value: unknown): unknown {
  return createMapOrNothing(
    listEntries(value).map((labelId, index) => [String(labelId), index]),
  );
}

function convertLabelIdsToV1(value: unknown): unknown {
  if (!isPlainObject(value)) return undefined;
  return createListOrNothing(
    Object.entries(value)
      .sort(([idA, a], [idB, b]) =>
        a === b ? (idA < idB ? -1 : 1) : Number(a) - Number(b),
      )
      .map(([labelId]) => labelId),
  );
}
