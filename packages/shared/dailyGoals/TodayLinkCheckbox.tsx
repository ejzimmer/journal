import { EmojiCheckbox } from '../controls/EmojiCheckbox';
import { useDailyGoals } from './useDailyGoals';

type TodayLinkCheckboxProps = { projectPath: string; subtaskPath: string };

export function TodayLinkCheckbox({
  projectPath,
  subtaskPath,
}: TodayLinkCheckboxProps) {
  const { hasFreeSlot, addGoal, removeGoal, hasGoal } = useDailyGoals();
  const isGoal = hasGoal(subtaskPath);

  return (
    <EmojiCheckbox
      emoji="🔗"
      label="On today"
      isChecked={isGoal}
      disabled={!isGoal && !hasFreeSlot}
      onChange={(event) =>
        event.target.checked
          ? addGoal({ projectPath, subtaskPath })
          : removeGoal(subtaskPath)
      }
    />
  );
}
