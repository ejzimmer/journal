export const NO_COMPREHENSION = { lookups: 0, aiQuestions: 0 };

export const findNextNumber = (
  items: Record<string, { number: number }> = {},
) => Math.max(0, ...Object.values(items).map(({ number }) => number)) + 1;

export type NewItem<T> = Omit<T, 'id'>;
