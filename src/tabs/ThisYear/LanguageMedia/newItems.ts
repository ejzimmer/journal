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
  const [hours, minutes, seconds] = (
    ['hours', 'minutes', 'seconds'] as const
  ).map((unit) => readText(data, `${name}-${unit}`));
  if (hours === undefined && minutes === undefined && seconds === undefined) {
    return undefined;
  }
  return Temporal.Duration.from({
    hours: Number(hours ?? 0),
    minutes: Number(minutes ?? 0),
    seconds: Number(seconds ?? 0),
  }).total('seconds');
};
