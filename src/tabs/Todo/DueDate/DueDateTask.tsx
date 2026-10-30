import { EditableDate } from '../../../shared/controls/EditableDate';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { CalendarTask, CALENDAR_KEY, STATUSES } from '../../../shared/types';
import { getDaysUntil, getToday } from '../../../shared/dates';
import { Switch } from '../../../shared/controls/Switch';
import { PlayButtonIcon } from '../../../shared/icons/PlayButton';
import { PauseButtonIcon } from '../../../shared/icons/PauseButton';
import { TickIcon } from '../../../shared/icons/Tick';
import { IconProps } from '../../../shared/icons/types';
import { EditableText } from '../../../shared/controls/EditableText';
import { CategoryPicker } from './CategoryPicker';

const getDateClass = (task: CalendarTask) => {
  const daysUntilDue = getDaysUntil(task.dueDate);

  if (daysUntilDue < 0) {
    return 'past';
  }
  if (daysUntilDue === 0) {
    return 'now';
  }
  if (daysUntilDue <= 7) {
    return 'this-week';
  }

  return '';
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
        className={`due-date ${getDateClass(task)}`}
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
      <Switch
        options={[...STATUSES]}
        value={task.status}
        onChange={onStatusChange}
        name={task.id}
        Option={StatusOption}
        className="led-switch"
      />
    </>
  );
}

const statusIconMapping: Record<CalendarTask['status'], React.FC<IconProps>> = {
  ready: PlayButtonIcon,
  paused: PauseButtonIcon,
  finished: TickIcon,
};

type StatusOptionProps = { value: CalendarTask['status'] };

function StatusOption({ value }: StatusOptionProps) {
  const Icon = statusIconMapping[value];
  return <Icon colour="currentColor" width="12px" />;
}
