import { ArrowCheckbox } from '../controls/ArrowCheckbox';
import { useDailyGoals } from './useDailyGoals';

type TodayLinkCheckboxProps = { projectPath: string; subtaskPath: string };

export function TodayLinkCheckbox({
  projectPath,
  subtaskPath,
}: TodayLinkCheckboxProps) {
  const { hasFreeSlot, addGoal, removeGoal, hasGoal } = useDailyGoals();
  const isGoal = hasGoal(subtaskPath);

  return (
    <ArrowCheckbox
      label="On today"
      isChecked={isGoal}
      isDisabled={!isGoal && !hasFreeSlot}
      onChange={(isChecked) =>
        isChecked
          ? addGoal({ projectPath, subtaskPath })
          : removeGoal(subtaskPath)
      }
    />
  );
}
