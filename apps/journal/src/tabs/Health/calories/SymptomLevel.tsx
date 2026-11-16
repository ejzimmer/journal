import { Tooltip } from 'shared/controls/Tooltip';
import { SymptomIcon } from './SymptomIcon';
import { Magnitude, Symptom } from './symptoms';

type SymptomLevelProps = {
  id: string;
  symptom: Symptom;
  level: Magnitude;
  isSelected: boolean;
  isActive: boolean;
  isTooltipOpen: boolean;
  onSelect: () => void;
};

export function SymptomLevel({
  id,
  symptom,
  level,
  isSelected,
  isActive,
  isTooltipOpen,
  onSelect,
}: SymptomLevelProps) {
  return (
    <Tooltip label={symptom.label} position="top-right" isOpen={isTooltipOpen}>
      {(triggerProps) => (
        <div
          {...triggerProps}
          id={id}
          role="gridcell"
          className="symptom-level"
          aria-label={`${symptom.label} ${level}`}
          aria-selected={isSelected}
          data-active={isActive || undefined}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onSelect}
        >
          <SymptomIcon symptom={symptom} magnitude={level} width="40px" />
        </div>
      )}
    </Tooltip>
  );
}
