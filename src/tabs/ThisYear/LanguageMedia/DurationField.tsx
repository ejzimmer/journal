import { FieldProps } from './fields';
import {
  formatHoursMinutesAndSeconds,
  formatMinutesAndSeconds,
} from './format';

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
