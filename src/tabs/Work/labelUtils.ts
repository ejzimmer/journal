import { WorkTask } from "./types"

export function addSourceListLabel(
  item: WorkTask,
  sourceList: WorkTask,
): WorkTask {
  const listLabel = sourceList.labels?.[0]
  if (!listLabel) {
    return item
  }

  if (item.labels?.some((label) => label.value === listLabel.value)) {
    return item
  }

  return { ...item, labels: [...(item.labels ?? []), listLabel] }
}
