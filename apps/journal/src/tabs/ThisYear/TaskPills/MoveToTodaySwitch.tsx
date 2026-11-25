import { useState } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { ArrowRightIcon } from 'shared/icons/ArrowRight';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { useDailyGoals } from 'shared/dailyGoals/useDailyGoals';
import { DailyTask, ONCE_KEY, DailyGoalItem } from '../../../types';

type MoveToTodaySwitchProps = { task: DailyTask };

export function MoveToTodaySwitch({ task }: MoveToTodaySwitchProps) {
  const { setValues } = useStorageContext();
  const { hasFreeSlot, nextPosition } = useDailyGoals<DailyGoalItem>();
  const [isOn, setIsOn] = useState(false);

  const moveTaskToToday = () =>
    setValues({
      [`${DAILY_GOALS_KEY}/${task.id}`]: { ...task, position: nextPosition },
      [`${ONCE_KEY}/${task.id}`]: null,
    });

  return (
    <button
      className={isOn ? 'move-to-today on' : 'move-to-today'}
      aria-label={`Move ${task.description} to today`}
      disabled={!hasFreeSlot}
      onClick={() => setIsOn(true)}
      // The knob sliding across is the only transition TaskPillList.css gives this button.
      onTransitionEnd={moveTaskToToday}
    >
      <ArrowRightIcon width="14px" />
    </button>
  );
}
