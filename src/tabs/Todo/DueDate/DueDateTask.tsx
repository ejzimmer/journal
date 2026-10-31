import { EditableDate } from '../../../shared/controls/EditableDate';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { CalendarTask, CALENDAR_KEY, STATUSES } from '../../../shared/types';
import {
  getToday,
  isBeforeToday,
  isThisWeek,
  isToday,
} from '../../../shared/dates';
import { Switch } from '../../../shared/controls/Switch';
import { EditableText } from '../../../shared/controls/EditableText';
import {
  SMALL_SCREEN_QUERY,
  useMediaQuery,
} from '../../../shared/useMediaQuery';
import { CategoryPicker } from './CategoryPicker';
import { StatusCycleButton } from './StatusCycleButton';
import { StatusIcon } from './StatusIcon';

const getDateClass = (dueDate: string) => {
  if (isBeforeToday(dueDate)) {
    return 'overdue';
  }
  if (isToday(dueDate)) {
    return 'due-today';
  }
  if (isThisWeek(dueDate)) {
    return 'this-week';
  }

  return 'later';
};

const createNextOccurrence = ({
  id,
  dueDate,
  ...task
}: CalendarTask): Omit<CalendarTask, 'id'> => ({
  ...task,
  dueDate: Temporal.PlainDate.from(dueDate).add({ weeks: 1 }).toString(),
  status: 'ready',
});

type DueDateTaskProps = { task: CalendarTask };

export function DueDateTask({ task }: DueDateTaskProps) {
  const { addItem, updateItem, deleteItem } = useStorageContext();
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);

  const onChange = (task: CalendarTask) => updateItem(CALENDAR_KEY, task);
  const onStatusChange = (status: CalendarTask['status']) => {
    const statusUpdateDate = getToday();

    if (status === 'finished' && task.repeats) {
      addItem<CalendarTask>(CALENDAR_KEY, {
        ...createNextOccurrence(task),
        statusUpdateDate,
      });
      onChange({ ...task, status, statusUpdateDate, repeats: false });
    } else {
      onChange({ ...task, status, statusUpdateDate });
    }
  };
  const onDelete = () => {
    deleteItem<CalendarTask>(CALENDAR_KEY, task);
  };

  return (
    <>
      <EditableDate
        value={task.dueDate}
        onChange={(date) => {
          if (date) {
            onChange({ ...task, dueDate: date });
          }
        }}
        className={`due-date ${getDateClass(task.dueDate)}`}
      />
      <div className="description">
        <CategoryPicker
          category={task.category}
          onChange={(category) => onChange({ ...task, category })}
        />
        <EditableText
          value={task.description}
          label="Description"
          className="task-screen"
          onChange={(description) => onChange({ ...task, description })}
          onDelete={onDelete}
        />
      </div>
      {isSmallScreen ? (
        <StatusCycleButton status={task.status} onChange={onStatusChange} />
      ) : (
        <Switch
          options={[...STATUSES]}
          value={task.status}
          onChange={onStatusChange}
          name={task.id}
          Option={StatusIcon}
          className="led-switch"
        />
      )}
    </>
  );
}
