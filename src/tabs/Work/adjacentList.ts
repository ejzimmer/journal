export type AdjacentListDestination = "previous" | "next" | "first" | "last"

export function getAdjacentListIndex(
  currentIndex: number,
  listLength: number,
  destination: AdjacentListDestination,
): number {
  switch (destination) {
    case "previous":
      return currentIndex - 1
    case "next":
      return currentIndex + 1
    case "first":
      return 0
    case "last":
      return listLength - 1
  }
}
