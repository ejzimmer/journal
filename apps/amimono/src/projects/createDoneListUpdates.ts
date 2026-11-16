import { sortByPosition } from 'shared/drag-and-drop/utils';
import { isProjectFinished } from './isProjectFinished';
import {
  LIST_KEYS,
  ProjectPosition,
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
  const updates: Record<string, ProjectPosition | null> = {};

  const getProjectsInList = (listKey: ListKey) =>
    sortByPosition(Object.values(storedLists[listKey] ?? {})).filter(
      ({ id }) => !!projects[id],
    );

  const findLastPositionIn = (listKey: ListKey) =>
    Math.max(
      0,
      ...Object.values(storedLists[listKey] ?? {}).map(
        (position) => position.position,
      ),
    );

  let nextDonePosition = findLastPositionIn('done') + 1;

  LIST_KEYS.filter((listKey) => listKey !== 'done').forEach((listKey) => {
    getProjectsInList(listKey)
      .filter((position) => isProjectFinished(projects[position.id]))
      .forEach((position) => {
        const previous: ListPosition = {
          list: listKey,
          position: position.position,
        };

        updates[`${LISTS_KEY}/done/${position.id}`] = {
          id: position.id,
          position: nextDonePosition++,
          previous,
        };
        updates[`${LISTS_KEY}/${listKey}/${position.id}`] = null;
      });
  });

  let nextFuturePosition = findLastPositionIn('future') + 1;

  getProjectsInList('done')
    .filter((position) => !isProjectFinished(projects[position.id]))
    .forEach((position) => {
      const previous = position.previous ?? {
        list: 'future',
        position: nextFuturePosition++,
      };

      updates[`${LISTS_KEY}/${previous.list}/${position.id}`] = {
        id: position.id,
        position: previous.position,
      };
      updates[`${LISTS_KEY}/done/${position.id}`] = null;
    });

  return updates;
}
