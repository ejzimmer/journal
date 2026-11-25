import { useStorageContext } from 'shared/FirebaseContext';
import { TaskGoal } from 'shared/dailyGoals/types';
import { DailyTask } from '../../types';
import { toggleDailyTaskStatus } from '../Todo/Today/toggleDailyTaskStatus';
import { DailyGoal } from './DailyGoal';

type TaskDailyGoalProps = { goal: TaskGoal };

export function TaskDailyGoal({ goal }: TaskDailyGoalProps) {
  const { useValue, setValue } = useStorageContext();
  const { value: task } = useValue<DailyTask>(goal.taskPath);
  if (!task) {
    return null;
  }

  return (
    <DailyGoal
      task={task}
      onToggle={() => setValue(goal.taskPath, toggleDailyTaskStatus(task))}
    />
  );
}
