import { useStorageContext } from 'shared/FirebaseContext';
import { getToday } from 'shared/dates';
import { WEEKLY_KEY, WeeklyTask } from '../../types';
import { AddDoneMenu } from '../Todo/ThisWeek/AddDoneMenu';
import { ProgressIndicator } from '../Todo/ThisWeek/ProgressIndicator';

type TodayWeeklyTaskProps = { task: WeeklyTask };

export function TodayWeeklyTask({ task }: TodayWeeklyTaskProps) {
  const { updateItem } = useStorageContext();
  const completedDates = task.completed ?? [];

  const updateCompletedDates = (completed: string[]) =>
    updateItem<WeeklyTask>(WEEKLY_KEY, { ...task, completed });
  const addDone = (date: string) =>
    updateCompletedDates([...completedDates, date]);

  return (
    <>
      <div className="weekly-add-done">
        <AddDoneMenu category={task.category} onAdd={addDone} />
      </div>
      <div className="task-screen">{task.description}</div>
      <ProgressIndicator
        completed={task.completed}
        frequency={task.frequency}
        description={task.description}
        onAdd={() => addDone(getToday())}
        onRemove={() => updateCompletedDates(completedDates.slice(0, -1))}
      />
    </>
  );
}
