export type ListDestination = "previous" | "next" | "first" | "last"

export function getDestinationListIndex(
  currentIndex: number,
  listLength: number,
  destination: ListDestination,
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
