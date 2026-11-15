import { Database, get, ref, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';
import { convertJournalProjects } from './convertJournalProjects';

const AMIMONO_ROOT = `${V2_ROOT}/amimono`;
const MIGRATED_AT_KEY = 'migratedFromJournalAt';

export async function migrateFromJournal(database: Database) {
  if (await readPath(database, `${AMIMONO_ROOT}/${MIGRATED_AT_KEY}`)) return;

  const [journalProjects, journalYarn] = await Promise.all([
    readPath(database, `${V2_ROOT}/projects`),
    readPath(database, `${V2_ROOT}/yarn`),
  ]);

  // A multi-path update is atomic, so the flag is only recorded if the copy
  // lands. Two runs racing each other write the same data.
  await update(ref(database, AMIMONO_ROOT), {
    ...convertJournalProjects(journalProjects ?? {}),
    ...(journalYarn && { yarn: journalYarn }),
    [MIGRATED_AT_KEY]: Date.now(),
  });
}

async function readPath(database: Database, path: string) {
  return (await get(ref(database, path))).val();
}
