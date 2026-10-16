import { getLanguageMediaPath, StoredMediaByYear } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function findUpdateIdPaths(node: unknown, path: string): string[] {
  if (!isRecord(node)) return [];
  return Object.entries(node).flatMap(([key, child]) =>
    key === 'updates' && isRecord(child)
      ? Object.entries(child)
          .filter(([, update]) => isRecord(update) && 'id' in update)
          .map(([updateKey]) => `${path}/updates/${updateKey}/id`)
      : findUpdateIdPaths(child, `${path}/${key}`),
  );
}

export function createUpdateIdRemoval(
  storedMediaByYear: StoredMediaByYear = {},
): Record<string, null> {
  return Object.fromEntries(
    Object.entries(storedMediaByYear).flatMap(([year, mediaById]) =>
      findUpdateIdPaths(mediaById, getLanguageMediaPath(Number(year))).map(
        (path) => [path, null],
      ),
    ),
  );
}
