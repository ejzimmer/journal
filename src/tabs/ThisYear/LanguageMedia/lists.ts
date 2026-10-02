export const listByNumber = <T extends { number: number }>(
  items?: Record<string, T>,
) => Object.values(items ?? {}).toSorted((a, b) => a.number - b.number);

export const listInAddedOrder = <T>(items?: Record<string, T>) =>
  Object.values(items ?? {});
