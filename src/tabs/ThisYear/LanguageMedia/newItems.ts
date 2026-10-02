import { parseDuration } from './format';

export const NO_COMPREHENSION = { lookups: 0, aiQuestions: 0 };

export const findNextNumber = (
  items: Record<string, { number: number }> = {},
) => Math.max(0, ...Object.values(items).map(({ number }) => number)) + 1;

export type NewItem<T> = Omit<T, 'id'>;

export const readText = (data: FormData, name: string) =>
  String(data.get(name) ?? '').trim() || undefined;

export const readNumber = (data: FormData, name: string) =>
  Number(data.get(name)) || undefined;

export const readDuration = (data: FormData, name: string) => {
  const duration = readText(data, name);
  return duration === undefined ? undefined : parseDuration(duration);
};
