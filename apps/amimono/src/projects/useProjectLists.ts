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
    Object.values(storedLists[listKey] ?? {})
      .toSorted((a, b) => a.position - b.position)
      .map((entry) => projects[entry.id])
      .filter((project): project is Project => !!project);

  return Object.fromEntries(
    LIST_KEYS.map((listKey) => [listKey, findProjectsInList(listKey)]),
  ) as ProjectLists;
}
