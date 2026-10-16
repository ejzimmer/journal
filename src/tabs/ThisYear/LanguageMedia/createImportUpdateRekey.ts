import { getLanguageMediaPath, StoredMediaByYear } from './types';

export const IMPORT_UPDATE_KEY = 'migration';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

function findImportUpdates(
  node: unknown,
  path: string,
): [string, Record<string, unknown>][] {
  if (!isRecord(node)) return [];
  return Object.entries(node).flatMap(([key, child]) =>
    key === 'updates' && isRecord(child) && isRecord(child[IMPORT_UPDATE_KEY])
      ? [[`${path}/updates`, child[IMPORT_UPDATE_KEY]]]
      : findImportUpdates(child, `${path}/${key}`),
  );
}

export function createImportUpdateRekey(
  storedMediaByYear: StoredMediaByYear = {},
  createId: () => string,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(storedMediaByYear).flatMap(([year, mediaById]) =>
      findImportUpdates(mediaById, getLanguageMediaPath(Number(year))).flatMap(
        ([updatesPath, update]) => [
          [`${updatesPath}/${IMPORT_UPDATE_KEY}`, null],
          [`${updatesPath}/${createId()}`, update],
        ],
      ),
    ),
  );
}
