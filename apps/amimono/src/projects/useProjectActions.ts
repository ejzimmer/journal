import { useStorageContext } from 'shared/FirebaseContext';
import { ProjectFields } from '../edit/projectDraft';
import {
  ListKey,
  LISTS_KEY,
  ProjectType,
  PROJECTS_KEY,
  StoredLists,
} from './types';

export function useProjectActions() {
  const { useValue, setValues } = useStorageContext();
  const { value: storedLists } = useValue<StoredLists>(LISTS_KEY);

  const findPositionAtEndOf = (listKey: ListKey) =>
    Math.max(
      0,
      ...Object.values(storedLists?.[listKey] ?? {}).map(
        (entry) => entry.position,
      ),
    ) + 1;

  const addProject = (name: string, type: ProjectType) => {
    const id = crypto.randomUUID();
    setValues({
      [`${PROJECTS_KEY}/${id}`]: { id, name, type },
      [`${LISTS_KEY}/future/${id}`]: {
        id,
        position: findPositionAtEndOf('future'),
      },
    });
  };

  const moveProject = (projectId: string, from: ListKey, to: ListKey) => {
    setValues({
      [`${LISTS_KEY}/${to}/${projectId}`]: {
        id: projectId,
        position: findPositionAtEndOf(to),
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
