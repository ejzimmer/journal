import { Label, LABELS_KEY, StoredLabel, WorkTask, WORK_KEY } from "./types"

type LegacyLabel = { value: string; colour: Label["colour"] }
type ItemWithLegacyLabels = WorkTask & { labels?: LegacyLabel[] }

type MigrationDeps = {
  addItem: <T>(parentName: string, item: Omit<T, "id">) => string | null
  updateItem: <T extends { id: string }>(parentName: string, item: T) => void
}

// One-time client-side migration for labels created before the id-based
// label store existed: scans every list and task for the old embedded
// `labels` array, reuses or creates a matching entry in work-labels for
// each distinct value, and rewrites the item to use labelIds instead.
// Idempotent per item (it's a no-op once `labels` is gone).
export function migrateLegacyLabels(
  lists: Record<string, WorkTask>,
  existingLabels: StoredLabel[],
  { addItem, updateItem }: MigrationDeps,
) {
  const labelIdByValue = new Map(existingLabels.map((l) => [l.value, l.id]))

  const resolveLabelId = (legacyLabel: LegacyLabel): string => {
    const existingId = labelIdByValue.get(legacyLabel.value)
    if (existingId) {
      return existingId
    }
    const newId = addItem<StoredLabel>(LABELS_KEY, {
      value: legacyLabel.value,
      colour: legacyLabel.colour,
    })
    const id = newId ?? legacyLabel.value
    labelIdByValue.set(legacyLabel.value, id)
    return id
  }

  const migrateItem = (item: ItemWithLegacyLabels, path: string) => {
    if (!item.labels) {
      return
    }
    const { labels, ...rest } = item
    const labelIds = [...(rest.labelIds ?? []), ...labels.map(resolveLabelId)]
    updateItem(path, { ...rest, labelIds })
  }

  Object.values(lists).forEach((list) => {
    migrateItem(list, WORK_KEY)
    Object.values(list.items ?? {}).forEach((task) => {
      migrateItem(task, `${WORK_KEY}/${list.id}/items`)
    })
  })
}
