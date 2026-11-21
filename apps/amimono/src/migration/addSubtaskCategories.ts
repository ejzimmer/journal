import { Database, get, ref, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';
import { SUBTASK_CATEGORY } from '../projects/types';

const PROJECTS_ROOT = `${V2_ROOT}/amimono/projects`;

type StoredProject = { subtasks?: Record<string, { category?: string }> };

// Subtasks saved before the journal's Today tab could show them have no
// category.
export async function addSubtaskCategories(database: Database) {
  const projects: Record<string, StoredProject> | null = (
    await get(ref(database, PROJECTS_ROOT))
  ).val();

  const updates = Object.fromEntries(
    Object.entries(projects ?? {}).flatMap(([projectId, project]) =>
      Object.entries(project.subtasks ?? {})
        .filter(([, subtask]) => subtask.category === undefined)
        .map(([subtaskId]) => [
          `${projectId}/subtasks/${subtaskId}/category`,
          SUBTASK_CATEGORY,
        ]),
    ),
  );
  if (Object.keys(updates).length === 0) return;

  await update(ref(database, PROJECTS_ROOT), updates);
}
