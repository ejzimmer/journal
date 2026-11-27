import { EmojiCheckbox } from '../controls/EmojiCheckbox';
import { ArrowRightIcon } from '../icons/ArrowRight';
import { useDailyGoals } from './useDailyGoals';

import './TodayLinkCheckbox.css';

type TodayLinkCheckboxProps = { projectPath: string; subtaskPath: string };

export function TodayLinkCheckbox({
  projectPath,
  subtaskPath,
}: TodayLinkCheckboxProps) {
  const { hasFreeSlot, addGoal, removeGoal, hasGoal } = useDailyGoals();
  const isGoal = hasGoal(subtaskPath);

  return (
    <EmojiCheckbox
      className="today-link-checkbox"
      emoji={<ArrowRightIcon width="14px" />}
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
