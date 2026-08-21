import { LABELS_KEY, StoredLabel, WorkTask } from "./types"

type CleanupDeps = {
  updateItem: <T extends { id: string }>(parentName: string, item: T) => void
}

// TEMPORARY one-off fix: before countLabelUsage started excluding done
// tasks, a label only ever attached to done tasks (which are never
// deleted) looked permanently "in use" and never got marked for removal.
// This sweeps the existing data once to mark any such label as pending
// removal now, same as if it had just become unused. Safe to delete this
// file and its call site once it's run against production data.
export function cleanupDoneOnlyLabels(
  lists: Record<string, WorkTask>,
  storedLabels: StoredLabel[],
  { updateItem }: CleanupDeps,
) {
  const activeIds = new Set<string>()
  Object.values(lists).forEach((list) => {
    list.labelIds?.forEach((id) => activeIds.add(id))
    Object.values(list.items ?? {}).forEach((task) => {
      if (task.status !== "done") {
        task.labelIds?.forEach((id) => activeIds.add(id))
      }
    })
  })

  storedLabels.forEach((label) => {
    if (!activeIds.has(label.id) && label.lastRemoved === undefined) {
      updateItem(LABELS_KEY, { ...label, lastRemoved: Date.now() })
    }
  })
}
