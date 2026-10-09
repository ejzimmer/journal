export const getItemsByNumber = <T extends { number: number }>(
  items?: Record<string, T>,
) => Object.values(items ?? {}).toSorted((a, b) => a.number - b.number);

export const getItemsInAddedOrder = <T>(items?: Record<string, T>) =>
  Object.values(items ?? {});
