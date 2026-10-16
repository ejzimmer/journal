import { PencilIcon } from '../../../shared/icons/Pencil';
import { AdventureMode } from './types';

type ModeOptionProps = {
  mode: AdventureMode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
};

export function ModeOption({
  mode,
  isSelected,
  onSelect,
  onEdit,
}: ModeOptionProps) {
  return (
    <div
      className="mode-option-item"
      style={{ '--mode-colour': mode.colour } as React.CSSProperties}
    >
      <label className="mode-option tooltip-container">
        <input
          type="radio"
          name="mode"
          aria-label={mode.name}
          checked={isSelected}
          onChange={onSelect}
        />
        <span className="tooltip-anchor" aria-hidden="true">
          {mode.emoji}
        </span>
        <span className="tooltip" aria-hidden="true">
          {mode.name}
        </span>
      </label>
      <button
        type="button"
        className="mode-option-action"
        aria-label={`Edit ${mode.name}`}
        onClick={onEdit}
      >
        <PencilIcon width="12px" />
      </button>
    </div>
  );
}
