import { Database, get, ref, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';

export async function removeMigratedJournalData(database: Database) {
  const [migratedAt, journalProjects, amimonoProjects, journalYarn] =
    await Promise.all([
      readPath(database, `${V2_ROOT}/amimono/migratedFromJournalAt`),
      readPath(database, `${V2_ROOT}/projects`),
      readPath(database, `${V2_ROOT}/amimono/projects`),
      readPath(database, `${V2_ROOT}/yarn`),
    ]);
  if (!migratedAt) return;

  const migratedProjectIds = Object.keys(journalProjects ?? {}).filter(
    (id) => id in (amimonoProjects ?? {}),
  );
  if (!migratedProjectIds.length && !journalYarn) return;

  await update(ref(database, V2_ROOT), {
    ...Object.fromEntries(
      migratedProjectIds.map((id) => [`projects/${id}`, null]),
    ),
    ...(journalYarn && { yarn: null }),
  });
}

async function readPath(database: Database, path: string) {
  return (await get(ref(database, path))).val();
}
