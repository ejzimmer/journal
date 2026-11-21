import { Database, get, ref, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';
import { PROJECT_CATEGORY } from '../projects/types';

const PROJECTS_ROOT = `${V2_ROOT}/amimono/projects`;

type StoredProject = { name?: string; category?: string };

// Earlier versions saved a project's title as name and gave it no category,
// where the journal's projects have a description and a category.
export async function convertProjectsToSharedShape(database: Database) {
  const projects: Record<string, StoredProject> | null = (
    await get(ref(database, PROJECTS_ROOT))
  ).val();

  const updates = Object.fromEntries(
    Object.entries(projects ?? {}).flatMap(([id, project]) => [
      ...(project.name === undefined
        ? []
        : [
            [`${id}/description`, project.name],
            [`${id}/name`, null],
          ]),
      ...(project.category === undefined
        ? [[`${id}/category`, PROJECT_CATEGORY]]
        : []),
    ]),
  );
  if (Object.keys(updates).length === 0) return;

  await update(ref(database, PROJECTS_ROOT), updates);
}
