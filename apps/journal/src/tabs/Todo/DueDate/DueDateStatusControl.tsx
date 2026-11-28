import { Switch } from 'shared/controls/Switch';
import { CalendarTask, STATUSES } from '../../../types';
import { StatusCycleButton } from './StatusCycleButton';
import { StatusIcon } from './StatusIcon';
import { useDueDateStatusChange } from './useDueDateStatusChange';

type DueDateStatusControlProps = { task: CalendarTask };

export function DueDateStatusControl({ task }: DueDateStatusControlProps) {
  const changeStatus = useDueDateStatusChange(task);

  return (
    <div className="due-date-status">
      <StatusCycleButton status={task.status} onChange={changeStatus} />
      <Switch
        options={[...STATUSES]}
        value={task.status}
        onChange={changeStatus}
        name={task.id}
        Option={StatusIcon}
        className="led-switch"
      />
    </div>
  );
}
