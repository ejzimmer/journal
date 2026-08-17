import { AdjacentListDestination } from "../../shared/drag-and-drop/types"

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
