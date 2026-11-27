import { CSSProperties } from 'react';
import { getToday } from 'shared/dates';
import { useFormToggle } from 'shared/controls/useFormToggle';
import { useStorageContext } from 'shared/FirebaseContext';
import { WEEKLY_KEY, WeeklyTask } from '../../../types';
import { AddDoneMenu } from '../../Todo/ThisWeek/AddDoneMenu';
import { CompletedDates } from '../../Todo/ThisWeek/CompletedDates';
import { getWeeklyProgress } from '../../Todo/ThisWeek/weeklyProgress';
import { BubbleMeter } from './BubbleMeter';
import { WeeklyTaskEditor } from './WeeklyTaskEditor';

import './TaskPills.css';
import './WeeklyTaskPill.css';

type WeeklyTaskPillProps = { task: WeeklyTask };

export function WeeklyTaskPill({ task }: WeeklyTaskPillProps) {
  const {
    isFormOpen: isEditing,
    triggerRef: descriptionRef,
    openForm: startEditing,
    closeForm: stopEditing,
  } = useFormToggle();
  const { updateItem, deleteItem } = useStorageContext();

  const updateTask = (task: WeeklyTask) =>
    updateItem<WeeklyTask>(WEEKLY_KEY, task);

  if (isEditing) {
    return (
      <WeeklyTaskEditor
        task={task}
        onChange={updateTask}
        onDelete={() => deleteItem<WeeklyTask>(WEEKLY_KEY, task)}
        onClose={stopEditing}
      />
    );
  }

  const completedDates = task.completed ?? [];
  const { numberDone, isDue, fillOpacity } = getWeeklyProgress(
    completedDates,
    task.frequency,
  );

  const addDone = (date: string) =>
    updateTask({ ...task, completed: [...completedDates, date] });

  const removeLastDone = () =>
    updateTask({ ...task, completed: completedDates.slice(0, -1) });

  return (
    <div className="today-task-description has-end-control weekly-task-pill">
      <AddDoneMenu
        category={task.category}
        className="weekly-add-done"
        onAdd={addDone}
      />
      <button
        ref={descriptionRef}
        className="description-button"
        onClick={startEditing}
      >
        {task.description}
      </button>
      <div
        className="weekly-progress"
        style={{ '--meter-opacity': fillOpacity } as CSSProperties}
      >
        <BubbleMeter
          label={`${task.description}: ${numberDone} of ${task.frequency} done`}
          segmentCount={task.frequency}
          filledCount={numberDone}
          onAdd={() => addDone(getToday())}
          onRemove={removeLastDone}
          className={isDue ? undefined : 'not-due'}
        />
        {numberDone > 0 && <CompletedDates dates={completedDates} />}
      </div>
    </div>
  );
}
