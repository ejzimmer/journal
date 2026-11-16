import { sortByPosition } from 'shared/drag-and-drop/utils';
import { findPreviousPosition } from './findPreviousPosition';
import { isProjectFinished } from './isProjectFinished';
import {
  LIST_KEYS,
  ListEntry,
  ListKey,
  LISTS_KEY,
  ListPosition,
  Project,
  StoredLists,
} from './types';

export function createDoneListUpdates(
  projects: Record<string, Project>,
  storedLists: StoredLists,
) {
  const updates: Record<string, ListEntry | null> = {};

  const getProjectsInList = (listKey: ListKey) =>
    sortByPosition(Object.values(storedLists[listKey] ?? {})).filter(
      ({ id }) => !!projects[id],
    );

  const findLastPositionIn = (listKey: ListKey) =>
    Math.max(
      0,
      ...Object.values(storedLists[listKey] ?? {}).map(
        (entry) => entry.position,
      ),
    );

  let nextDonePosition = findLastPositionIn('done') + 1;

  LIST_KEYS.filter((listKey) => listKey !== 'done').forEach((listKey) => {
    getProjectsInList(listKey)
      .filter((entry) => isProjectFinished(projects[entry.id]))
      .forEach((entry) => {
        const previous: ListPosition = {
          list: listKey,
          position: entry.position,
        };

        updates[`${LISTS_KEY}/done/${entry.id}`] = {
          id: entry.id,
          position: nextDonePosition++,
          previous,
        };
        updates[`${LISTS_KEY}/${listKey}/${entry.id}`] = null;
      });
  });

  let nextFuturePosition = findLastPositionIn('future') + 1;

  getProjectsInList('done')
    .filter((entry) => !isProjectFinished(projects[entry.id]))
    .forEach((entry) => {
      const previous = findPreviousPosition(entry) ?? {
        list: 'future',
        position: nextFuturePosition++,
      };

      updates[`${LISTS_KEY}/${previous.list}/${entry.id}`] = {
        id: entry.id,
        position: previous.position,
      };
      updates[`${LISTS_KEY}/done/${entry.id}`] = null;
    });

  return updates;
}
