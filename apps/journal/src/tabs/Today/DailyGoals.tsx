import { useStorageContext } from 'shared/FirebaseContext';
import {
  isSubtaskGoal,
  TODAY_SLOT_COUNT,
  DAILY_GOALS_KEY,
} from 'shared/dailyGoals/types';
import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyTask, DailyGoalItem } from '../../types';
import { toggleDailyTaskStatus } from '../Todo/Today/toggleDailyTaskStatus';
import { DailyGoal } from './DailyGoal';
import { SubtaskDailyGoal } from './SubtaskDailyGoal';

export function DailyGoals() {
  const { updateItem } = useStorageContext();
  const { goals } = useDailyGoals<DailyGoalItem>();
  const emptySlotCount = Math.max(0, TODAY_SLOT_COUNT - goals.length);

  return (
    <ol className="today-slots">
      {goals.map((goal) =>
        isSubtaskGoal(goal) ? (
          <SubtaskDailyGoal key={goal.id} goal={goal} />
        ) : (
          <DailyGoal
            key={goal.id}
            task={goal}
            onToggle={() =>
              updateItem<DailyTask>(
                DAILY_GOALS_KEY,
                toggleDailyTaskStatus(goal),
              )
            }
          />
        ),
      )}
      {Array.from({ length: emptySlotCount }, (_, index) => (
        <li key={index} className="item today-slot empty" />
      ))}
    </ol>
  );
}
