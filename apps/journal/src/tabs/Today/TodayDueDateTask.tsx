import { formatDayAndMonth } from 'shared/dates';
import { CalendarTask } from '../../types';
import { DueDateStatusControl } from '../Todo/DueDate/DueDateStatusControl';
import { getDueDateClass } from '../Todo/DueDate/getDueDateClass';

type TodayDueDateTaskProps = { task: CalendarTask };

export function TodayDueDateTask({ task }: TodayDueDateTaskProps) {
  return (
    <>
      <div className={`due-date ${getDueDateClass(task.dueDate)}`}>
        {formatDayAndMonth(task.dueDate)}
      </div>
      <div className="description">
        <span className="category-label">{task.category}</span>
        <div className="task-screen">{task.description}</div>
      </div>
      <DueDateStatusControl task={task} />
    </>
  );
}
