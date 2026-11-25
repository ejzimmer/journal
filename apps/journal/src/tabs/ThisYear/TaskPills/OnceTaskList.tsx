import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyTask, ONCE_KEY } from '../../../types';
import { ArrowSwitch } from './ArrowSwitch';
import { TaskPillList } from './TaskPillList';

export function OnceTaskList() {
  const { hasFreeSlot, addTaskGoal, removeTaskGoal, hasTaskGoal } =
    useDailyGoals();

  const renderDoTodaySwitch = (task: DailyTask) => {
    const taskPath = `${ONCE_KEY}/${task.id}`;
    const isInSlot = hasTaskGoal(taskPath);

    return (
      <ArrowSwitch
        label={`Do ${task.description} today`}
        isOn={isInSlot}
        isDisabled={!isInSlot && !hasFreeSlot}
        onClick={() =>
          isInSlot ? removeTaskGoal(taskPath) : addTaskGoal(taskPath)
        }
      />
    );
  };

  return <TaskPillList listId={ONCE_KEY} renderAction={renderDoTodaySwitch} />;
}
