import { STATUS_NAMES } from './format';
import { Status, STATUSES } from './types';

export function StatusSelect({
  name,
  status = 'not-started',
  onChange,
}: {
  name: string;
  status?: Status;
  onChange: (status: Status) => void;
}) {
  return (
    <select
      aria-label={`Status of ${name}`}
      value={status}
      onChange={(event) => onChange(event.target.value as Status)}
    >
      {STATUSES.map((option) => (
        <option key={option} value={option}>
          {STATUS_NAMES[option]}
        </option>
      ))}
    </select>
  );
}
