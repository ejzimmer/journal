import { useStorageContext } from 'shared/FirebaseContext';
import { ProjectFields } from '../edit/projectDraft';
import { findPreviousPosition } from './findPreviousPosition';
import {
  Craft,
  ListEntry,
  ListKey,
  LISTS_KEY,
  ProjectType,
  PROJECTS_KEY,
  StoredLists,
} from './types';

export function useProjectActions() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedLists } = useValue<StoredLists>(LISTS_KEY);

  const findPositionsIn = (listKey: ListKey) =>
    Object.values(storedLists?.[listKey] ?? {}).map((entry) => entry.position);

  const findPositionAtEndOf = (listKey: ListKey) =>
    Math.max(0, ...findPositionsIn(listKey)) + 1;

  const findPositionAtStartOf = (listKey: ListKey) =>
    Math.min(1, ...findPositionsIn(listKey)) - 1;

  const isSwappingQueues = (from: ListKey, to: ListKey) =>
    from !== 'future' && to !== 'future';

  const addProject = (name: string, type: ProjectType, craft?: Craft) => {
    const id = crypto.randomUUID();
    setValues({
      [`${PROJECTS_KEY}/${id}`]: { id, name, type, ...(craft && { craft }) },
      [`${LISTS_KEY}/future/${id}`]: {
        id,
        position: findPositionAtEndOf('future'),
      },
    });
  };

  const findPositionInTarget = (
    entry: ListEntry | undefined,
    from: ListKey,
    to: ListKey,
  ) => {
    const previous = findPreviousPosition(entry);
    if (previous?.list === to) {
      return previous.position;
    }
    return isSwappingQueues(from, to)
      ? findPositionAtStartOf(to)
      : findPositionAtEndOf(to);
  };

  const moveProjectToTopOf = (listKey: ListKey, projectId: string) => {
    setValues({
      [`${LISTS_KEY}/${listKey}/${projectId}/position`]:
        findPositionAtStartOf(listKey),
    });
  };

  const moveProject = (projectId: string, from: ListKey, to: ListKey) => {
    if (from === to) {
      moveProjectToTopOf(to, projectId);
      return;
    }

    const entry = storedLists?.[from]?.[projectId];
    const isLeavingPortableForPriority =
      from === 'portable' && to === 'priority';

    setValues({
      [`${LISTS_KEY}/${to}/${projectId}`]: {
        id: projectId,
        position: findPositionInTarget(entry, from, to),
        ...(isLeavingPortableForPriority &&
          entry && {
            previous: { list: 'portable', position: entry.position },
          }),
      },
      [`${LISTS_KEY}/${from}/${projectId}`]: null,
    });
  };

  const updateProject = (projectId: string, fields: ProjectFields) => {
    setValues(
      Object.fromEntries(
        Object.entries(fields).map(([field, value]) => [
          `${PROJECTS_KEY}/${projectId}/${field}`,
          value,
        ]),
      ),
    );
  };

  const deleteProject = (projectId: string, listKey: ListKey) => {
    setValues({
      [`${PROJECTS_KEY}/${projectId}`]: null,
      [`${LISTS_KEY}/${listKey}/${projectId}`]: null,
    });
  };

  return { addProject, moveProject, updateProject, deleteProject };
}
