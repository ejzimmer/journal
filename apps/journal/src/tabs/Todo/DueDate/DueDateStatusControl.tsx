import { useStorageContext } from 'shared/FirebaseContext';
import { getToday } from 'shared/dates';
import { Switch } from 'shared/controls/Switch';
import { CalendarTask, CALENDAR_KEY, STATUSES } from '../../../types';
import { StatusCycleButton } from './StatusCycleButton';
import { StatusIcon } from './StatusIcon';

const createNextOccurrence = ({
  id,
  dueDate,
  ...task
}: CalendarTask): Omit<CalendarTask, 'id'> => ({
  ...task,
  dueDate: Temporal.PlainDate.from(dueDate).add({ weeks: 1 }).toString(),
  status: 'ready',
});

type DueDateStatusControlProps = { task: CalendarTask };

export function DueDateStatusControl({ task }: DueDateStatusControlProps) {
  const { addItem, updateItem } = useStorageContext();

  const changeStatus = (status: CalendarTask['status']) => {
    const statusUpdateDate = getToday();

    if (status === 'finished' && task.repeats) {
      addItem<CalendarTask>(CALENDAR_KEY, {
        ...createNextOccurrence(task),
        statusUpdateDate,
      });
      updateItem(CALENDAR_KEY, {
        ...task,
        status,
        statusUpdateDate,
        repeats: false,
      });
    } else {
      updateItem(CALENDAR_KEY, { ...task, status, statusUpdateDate });
    }
  };

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
