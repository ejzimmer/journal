import { isPlainTree } from '../../../shared/localFirst/pathTree';
import { getLanguageMediaPath, StoredMediaByYear } from './types';

function findUpdateIdPaths(node: unknown, path: string): string[] {
  if (!isPlainTree(node)) return [];
  return Object.entries(node).flatMap(([key, child]) =>
    key === 'updates' && isPlainTree(child)
      ? Object.entries(child)
          .filter(([, update]) => isPlainTree(update) && 'id' in update)
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
