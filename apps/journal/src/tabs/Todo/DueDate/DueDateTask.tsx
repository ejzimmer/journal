import { EditableDate } from 'shared/controls/EditableDate';
import { useStorageContext } from 'shared/FirebaseContext';
import { CalendarTask, CALENDAR_KEY } from '../../../types';
import { EditableText } from 'shared/controls/EditableText';
import { SMALL_SCREEN_QUERY, useMediaQuery } from 'shared/useMediaQuery';
import { CategoryPicker } from './CategoryPicker';
import { DueDateStatusControl } from './DueDateStatusControl';
import { getDueDateClass } from './getDueDateClass';

type DueDateTaskProps = { task: CalendarTask };

export function DueDateTask({ task }: DueDateTaskProps) {
  const { updateItem, deleteItem } = useStorageContext();
  const isSmallScreen = useMediaQuery(SMALL_SCREEN_QUERY);

  const onChange = (task: CalendarTask) => updateItem(CALENDAR_KEY, task);
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
        className={`due-date ${getDueDateClass(task.dueDate)}`}
      />
      <div className="description">
        {!isSmallScreen && (
          <CategoryPicker
            category={task.category}
            onChange={(category) => onChange({ ...task, category })}
          />
        )}
        <EditableText
          value={task.description}
          label="Description"
          className="task-screen"
          onChange={(description) => onChange({ ...task, description })}
          onDelete={onDelete}
        />
      </div>
      <DueDateStatusControl task={task} />
    </>
  );
}
