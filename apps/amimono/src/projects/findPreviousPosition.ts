import { ListEntry, ListPosition } from './types';

export function findPreviousPosition(
  entry: ListEntry | undefined,
): ListPosition | undefined {
  if (entry?.previous) return entry.previous;
  if (entry?.portablePosition !== undefined) {
    return { list: 'portable', position: entry.portablePosition };
  }
  return undefined;
}
