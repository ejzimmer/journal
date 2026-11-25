import {
  isSubtaskGoal,
  isTaskGoal,
  TODAY_SLOT_COUNT,
} from 'shared/dailyGoals/types';
import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyGoalItem } from '../../types';
import { SubtaskDailyGoal } from './SubtaskDailyGoal';
import { TaskDailyGoal } from './TaskDailyGoal';

export function DailyGoals() {
  const { goals } = useDailyGoals<DailyGoalItem>();
  const emptySlotCount = Math.max(0, TODAY_SLOT_COUNT - goals.length);

  return (
    <ol className="today-slots">
      {goals.map((goal) => {
        if (isSubtaskGoal(goal)) {
          return <SubtaskDailyGoal key={goal.id} goal={goal} />;
        }
        if (isTaskGoal(goal)) {
          return <TaskDailyGoal key={goal.id} goal={goal} />;
        }
        return null;
      })}
      {Array.from({ length: emptySlotCount }, (_, index) => (
        <li key={index} className="item today-slot empty" />
      ))}
    </ol>
  );
}
