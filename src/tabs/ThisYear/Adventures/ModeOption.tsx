import { AdventureMode } from './types';

type ModeOptionProps = {
  mode: AdventureMode;
  isSelected: boolean;
  onSelect: () => void;
};

export function ModeOption({ mode, isSelected, onSelect }: ModeOptionProps) {
  return (
    <label
      className="mode-option tooltip-container"
      style={{ '--mode-colour': mode.colour } as React.CSSProperties}
    >
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
  );
}
