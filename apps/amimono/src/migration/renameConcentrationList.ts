import { Database, get, ref, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';

const LISTS_ROOT = `${V2_ROOT}/amimono/lists`;

// Before the priority list existed, its projects were stored under
// "concentration".
export async function renameConcentrationList(database: Database) {
  const concentration: Record<string, unknown> | null = (
    await get(ref(database, `${LISTS_ROOT}/concentration`))
  ).val();
  if (!concentration) return;

  await update(ref(database, LISTS_ROOT), {
    ...Object.fromEntries(
      Object.entries(concentration).map(([id, entry]) => [
        `priority/${id}`,
        entry,
      ]),
    ),
    concentration: null,
  });
}
