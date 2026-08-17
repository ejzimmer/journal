import { COLOURS, Colour, WorkTask } from "./types"

const isColour = (text?: string): text is Colour =>
  !!(text && COLOURS.find((c) => c === text))

export function getNextColour(colours: Colour[]): Colour {
  let firstUnused = COLOURS.find((c) => !colours.includes(c))
  if (firstUnused) {
    return firstUnused
  }

  const usageCount = colours.reduce(
    (usages, colour) => {
      usages[colour] = (usages[colour] ?? 0) + 1
      return usages
    },
    {} as Record<(typeof COLOURS)[number], number>,
  )
  const lowestUsage = Math.min(...Object.values(usageCount))
  const lowestUsageColour = Object.entries(usageCount).find(
    ([, count]) => count === lowestUsage,
  )?.[0]

  return isColour(lowestUsageColour) ? lowestUsageColour : COLOURS[0]
}

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
