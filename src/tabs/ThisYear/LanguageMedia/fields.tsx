import {
  formatHoursMinutesAndSeconds,
  formatMinutesAndSeconds,
  parseDuration,
} from './format';

export const readText = (data: FormData, name: string) =>
  String(data.get(name) ?? '').trim() || undefined;

export const readNumber = (data: FormData, name: string) =>
  Number(data.get(name)) || undefined;

export const readDuration = (data: FormData, name: string) => {
  const duration = readText(data, name);
  return duration === undefined ? undefined : parseDuration(duration);
};

type FieldProps<T> = {
  label: string;
  name: string;
  defaultValue?: T;
  isRequired?: boolean;
};

export function TextField({
  label,
  name,
  defaultValue,
  isRequired,
  type = 'text',
}: FieldProps<string> & { type?: 'text' | 'url' }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={isRequired}
      />
    </label>
  );
}

export function NumberField({
  label,
  name,
  defaultValue,
  isRequired,
  min = 1,
}: FieldProps<number> & { min?: number }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="number"
        min={min}
        defaultValue={defaultValue}
        required={isRequired}
      />
    </label>
  );
}

const DURATION_FORMATS = {
  'mm:ss': { pattern: '\\d+:\\d{2}', format: formatMinutesAndSeconds },
  'hh:mm:ss': {
    pattern: '\\d+:\\d{2}:\\d{2}',
    format: formatHoursMinutesAndSeconds,
  },
};

export function DurationField({
  label,
  name,
  defaultValue,
  durationFormat,
}: FieldProps<number> & { durationFormat: keyof typeof DURATION_FORMATS }) {
  const { pattern, format } = DURATION_FORMATS[durationFormat];

  return (
    <label>
      {label}
      <input
        name={name}
        pattern={pattern}
        defaultValue={
          defaultValue === undefined ? undefined : format(defaultValue)
        }
      />
    </label>
  );
}
