import { Database, get, ref, update } from 'firebase/database';
import { V2_ROOT } from 'shared/localFirst/dataShape';

const LISTS_ROOT = `${V2_ROOT}/amimono/lists`;

type StoredPosition = { portablePosition?: number };

// Earlier versions saved a Priority project's spot in Portable as
// portablePosition rather than as previous.
export async function convertPortablePositions(database: Database) {
  const priority: Record<string, StoredPosition> | null = (
    await get(ref(database, `${LISTS_ROOT}/priority`))
  ).val();

  const updates = Object.fromEntries(
    Object.entries(priority ?? {})
      .filter(([, position]) => position.portablePosition !== undefined)
      .flatMap(([id, position]) => [
        [
          `priority/${id}/previous`,
          { list: 'portable', position: position.portablePosition },
        ],
        [`priority/${id}/portablePosition`, null],
      ]),
  );
  if (Object.keys(updates).length === 0) return;

  await update(ref(database, LISTS_ROOT), updates);
}
