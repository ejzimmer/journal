import { EmojiCheckbox } from '../controls/EmojiCheckbox';
import { useDailyGoals } from './useDailyGoals';

type TodayLinkCheckboxProps = { projectPath: string; subtaskPath: string };

export function TodayLinkCheckbox({
  projectPath,
  subtaskPath,
}: TodayLinkCheckboxProps) {
  const { hasFreeSlot, addSubtaskGoal, removeSubtaskGoal, hasSubtaskGoal } =
    useDailyGoals();
  const isGoal = hasSubtaskGoal(subtaskPath);

  return (
    <EmojiCheckbox
      emoji="🔗"
      label="On today"
      isChecked={isGoal}
      disabled={!isGoal && !hasFreeSlot}
      onChange={(event) =>
        event.target.checked
          ? addSubtaskGoal(projectPath, subtaskPath)
          : removeSubtaskGoal(subtaskPath)
      }
    />
  );
}
