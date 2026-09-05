import { WorkTask } from "./types"

export function getAppendPosition(list: WorkTask): number {
  return list.items
    ? Object.values(list.items).reduce(
        (highest, item) =>
          item.position ? Math.max(highest, item.position) : highest,
        0,
      )
    : 0
}
