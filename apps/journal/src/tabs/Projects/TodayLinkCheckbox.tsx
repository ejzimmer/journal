import { useTodaySlots } from '../Today/useTodaySlots';

type TodayLinkCheckboxProps = {
  subtaskPath: string;
  hasLegacyLink: boolean;
};

export function TodayLinkCheckbox({
  subtaskPath,
  hasLegacyLink,
}: TodayLinkCheckboxProps) {
  const {
    hasFreeSlot,
    addSubtaskToSlot,
    removeSubtaskFromSlot,
    isSubtaskInSlot,
  } = useTodaySlots();
  const isInSlot = isSubtaskInSlot(subtaskPath);

  return (
    <label className="copy-button">
      <input
        type="checkbox"
        className="hidden"
        aria-label="On today"
        checked={isInSlot || hasLegacyLink}
        disabled={hasLegacyLink || (!isInSlot && !hasFreeSlot)}
        onChange={(event) =>
          event.target.checked
            ? addSubtaskToSlot(subtaskPath)
            : removeSubtaskFromSlot(subtaskPath)
        }
      />
      <span aria-hidden="true">🔗</span>
    </label>
  );
}
