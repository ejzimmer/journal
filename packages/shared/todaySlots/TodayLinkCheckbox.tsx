import { EmojiCheckbox } from '../controls/EmojiCheckbox';
import { useTodaySlots } from './useTodaySlots';

type TodayLinkCheckboxProps = { projectPath: string; subtaskPath: string };

export function TodayLinkCheckbox({
  projectPath,
  subtaskPath,
}: TodayLinkCheckboxProps) {
  const {
    hasFreeSlot,
    addSubtaskToSlot,
    removeSubtaskFromSlot,
    isSubtaskInSlot,
  } = useTodaySlots();
  const isInSlot = isSubtaskInSlot(subtaskPath);

  return (
    <EmojiCheckbox
      emoji="🔗"
      label="On today"
      isChecked={isInSlot}
      disabled={!isInSlot && !hasFreeSlot}
      onChange={(event) =>
        event.target.checked
          ? addSubtaskToSlot(projectPath, subtaskPath)
          : removeSubtaskFromSlot(subtaskPath)
      }
    />
  );
}
