import { ContextType } from "../../shared/FirebaseContext"
import { WorkTask, Label, LABELS_KEY, WORK_KEY } from "./types"

type LegacyLabel = { value: string; colour: Label["colour"] }
type TaskWithLegacyLabels = WorkTask & { labels?: LegacyLabel[] }

export function migrateLegacyLabels(
  lists: Record<string, WorkTask>,
  existingLabels: Label[],
  storageContext: Pick<ContextType, "addItem" | "updateItem">,
) {
  const labelIdByValue = new Map(existingLabels.map((l) => [l.value, l.id]))

  const resolveLabelId = (legacyLabel: LegacyLabel): string => {
    const existingId = labelIdByValue.get(legacyLabel.value)
    if (existingId) {
      return existingId
    }
    const newId = storageContext.addItem<Label>(LABELS_KEY, {
      value: legacyLabel.value,
      colour: legacyLabel.colour,
    })
    const id = newId ?? legacyLabel.value
    labelIdByValue.set(legacyLabel.value, id)
    return id
  }

  const migrateItem = (item: TaskWithLegacyLabels, path: string) => {
    if (!item.labels) {
      return
    }
    const { labels, ...rest } = item
    const labelIds = [...(rest.labelIds ?? []), ...labels.map(resolveLabelId)]
    storageContext.updateItem(path, { ...rest, labelIds })
  }

  Object.values(lists).forEach((list) => {
    migrateItem(list, WORK_KEY)
    Object.values(list.items ?? {}).forEach((task) => {
      migrateItem(task, `${WORK_KEY}/${list.id}/items`)
    })
  })
}
