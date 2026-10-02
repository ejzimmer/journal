import { parseDuration } from './format';

export const readText = (data: FormData, name: string) =>
  String(data.get(name) ?? '').trim() || undefined;

export const readNumber = (data: FormData, name: string) =>
  Number(data.get(name)) || undefined;

export const readDuration = (data: FormData, name: string) => {
  const duration = readText(data, name);
  return duration === undefined ? undefined : parseDuration(duration);
};

export type FieldProps<T> = {
  label: string;
  name: string;
  defaultValue?: T;
  isRequired?: boolean;
};

export const readRequiredNumber = (
  data: FormData,
  name: string,
  fallback: number,
) => readNumber(data, name) ?? fallback;
