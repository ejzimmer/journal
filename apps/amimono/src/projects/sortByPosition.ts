export function sortByPosition<T extends { position: number }>(items: T[]) {
  return items.toSorted((a, b) => a.position - b.position);
}
