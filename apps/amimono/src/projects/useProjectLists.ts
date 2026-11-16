import { sortByPosition } from 'shared/drag-and-drop/utils';
import { useStorageContext } from 'shared/FirebaseContext';
import {
  LIST_KEYS,
  ListKey,
  LISTS_KEY,
  Project,
  ProjectLists,
  PROJECTS_KEY,
  StoredLists,
} from './types';

export function useProjectLists() {
  const { useValue } = useStorageContext();
  const { value: projects, loading: projectsLoading } =
    useValue<Record<string, Project>>(PROJECTS_KEY);
  const { value: storedLists, loading: listsLoading } =
    useValue<StoredLists>(LISTS_KEY);

  return {
    lists: arrangeProjectsInLists(projects ?? {}, storedLists ?? {}),
    loading: projectsLoading || listsLoading,
  };
}

function arrangeProjectsInLists(
  projects: Record<string, Project>,
  storedLists: StoredLists,
): ProjectLists {
  const findProjectsInList = (listKey: ListKey) =>
    sortByPosition(Object.values(storedLists[listKey] ?? {}))
      .map((position) => projects[position.id])
      .filter((project): project is Project => !!project);

  return Object.fromEntries(
    LIST_KEYS.map((listKey) => [listKey, findProjectsInList(listKey)]),
  ) as ProjectLists;
}
