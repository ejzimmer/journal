import { DeleteWithConfirmation } from 'shared/controls/DeleteWithConfirmation';
import { Tooltip } from 'shared/controls/Tooltip';
import { PencilIcon } from 'shared/icons/Pencil';
import { AdventureMode } from './types';

type ModeOptionProps = {
  mode: AdventureMode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete?: () => void;
};

export function ModeOption({
  mode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: ModeOptionProps) {
  return (
    <div
      className="mode-option-item"
      style={{ '--mode-colour': mode.colour } as React.CSSProperties}
    >
      <Tooltip label={mode.name} position="top">
        {(triggerProps) => (
          <label {...triggerProps} className="mode-option">
            <input
              type="radio"
              name="mode"
              aria-label={mode.name}
              checked={isSelected}
              onChange={onSelect}
            />
            <span aria-hidden="true">{mode.emoji}</span>
          </label>
        )}
      </Tooltip>
      <button
        type="button"
        className="mode-option-action"
        aria-label={`Edit ${mode.name}`}
        onClick={onEdit}
      >
        <PencilIcon width="12px" />
      </button>
      {onDelete && (
        <DeleteWithConfirmation
          className="mode-option-action"
          label={`Delete ${mode.name}`}
          confirmLabel={`Confirm delete ${mode.name}`}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
