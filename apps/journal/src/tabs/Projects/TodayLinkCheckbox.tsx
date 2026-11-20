import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { useTodaySlots } from '../Today/useTodaySlots';

type TodayLinkCheckboxProps = { subtaskPath: string };

export function TodayLinkCheckbox({ subtaskPath }: TodayLinkCheckboxProps) {
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
          ? addSubtaskToSlot(subtaskPath)
          : removeSubtaskFromSlot(subtaskPath)
      }
    />
  );
}
