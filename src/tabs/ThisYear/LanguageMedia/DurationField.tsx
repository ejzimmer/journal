import { Fragment } from 'react';

const DURATION_UNITS = {
  'mm:ss': ['minutes', 'seconds'],
  'hh:mm:ss': ['hours', 'minutes', 'seconds'],
} as const;

const UNIT_NAMES = { hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds' };

const padSegment = (event: React.FocusEvent<HTMLInputElement>) => {
  const input = event.currentTarget;
  if (input.value) input.value = input.value.padStart(2, '0');
};

export function DurationField({
  label,
  name,
  durationFormat,
}: {
  label: string;
  name: string;
  durationFormat: keyof typeof DURATION_UNITS;
}) {
  const units = DURATION_UNITS[durationFormat];

  return (
    <fieldset>
      <legend>{label}</legend>
      {units.map((unit, index) => (
        <Fragment key={unit}>
          {index > 0 && ':'}
          <input
            name={`${name}-${unit}`}
            aria-label={UNIT_NAMES[unit]}
            inputMode="numeric"
            pattern={index === 0 ? '\\d+' : '[0-5]?\\d'}
            size={2}
            onBlur={padSegment}
          />
        </Fragment>
      ))}
    </fieldset>
  );
}
