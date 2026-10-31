import { CalendarTask, STATUSES } from '../../../shared/types';
import { StatusIcon } from './StatusIcon';

type Status = CalendarTask['status'];

const getNextStatus = (status: Status) =>
  STATUSES[(STATUSES.indexOf(status) + 1) % STATUSES.length];

type StatusCycleButtonProps = {
  status: Status;
  onChange: (status: Status) => void;
};

export function StatusCycleButton({
  status,
  onChange,
}: StatusCycleButtonProps) {
  return (
    <button
      type="button"
      className={`status-cycle-button led status-${status}`}
      aria-label={`Status: ${status}`}
      onClick={() => onChange(getNextStatus(status))}
    >
      <StatusIcon value={status} />
    </button>
  );
}
