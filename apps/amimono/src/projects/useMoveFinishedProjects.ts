import { useEffect, useRef } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { createDoneListUpdates } from './createDoneListUpdates';
import { LISTS_KEY, Project, PROJECTS_KEY, StoredLists } from './types';

export function useMoveFinishedProjects() {
  const { useValue, setValues } = useStorageContext();
  const { value: projects, loading: projectsLoading } =
    useValue<Record<string, Project>>(PROJECTS_KEY);
  const { value: storedLists, loading: listsLoading } =
    useValue<StoredLists>(LISTS_KEY);
  const isLoading = projectsLoading || listsLoading;
  const hasMovedOnLoad = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const moveFinishedProjects = () => {
      const updates = createDoneListUpdates(projects ?? {}, storedLists ?? {});
      if (Object.keys(updates).length > 0) setValues(updates);
    };

    if (!hasMovedOnLoad.current) {
      hasMovedOnLoad.current = true;
      moveFinishedProjects();
    }

    document.addEventListener('visibilitychange', moveFinishedProjects);
    return () =>
      document.removeEventListener('visibilitychange', moveFinishedProjects);
  }, [isLoading, projects, storedLists, setValues]);
}
