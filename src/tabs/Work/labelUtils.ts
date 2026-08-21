import { WorkTask } from "./types"

export function addSourceListLabel(
  item: WorkTask,
  sourceList: WorkTask,
): WorkTask {
  const listLabelId = sourceList.labelIds?.[0]
  if (!listLabelId) {
    return item
  }

  if (item.labelIds?.includes(listLabelId)) {
    return item
  }

  return { ...item, labelIds: [...(item.labelIds ?? []), listLabelId] }
}
