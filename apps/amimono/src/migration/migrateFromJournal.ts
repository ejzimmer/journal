import { Database, get, ref, runTransaction, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';
import { convertJournalProjects } from './convertJournalProjects';

const AMIMONO_ROOT = `${V2_ROOT}/amimono`;
const MIGRATED_AT_PATH = `${AMIMONO_ROOT}/migratedFromJournalAt`;

export async function migrateFromJournal(database: Database) {
  const { committed } = await runTransaction(
    ref(database, MIGRATED_AT_PATH),
    (migratedAt) => (migratedAt ? undefined : Date.now()),
  );
  if (!committed) return;

  const [journalProjects, journalYarn] = await Promise.all([
    readPath(database, `${V2_ROOT}/projects`),
    readPath(database, `${V2_ROOT}/yarn`),
  ]);
  const projectUpdates = convertJournalProjects(journalProjects ?? {});

  await update(ref(database, AMIMONO_ROOT), {
    ...projectUpdates,
    ...(journalYarn && { yarn: journalYarn }),
  });
}

async function readPath(database: Database, path: string) {
  return (await get(ref(database, path))).val();
}
