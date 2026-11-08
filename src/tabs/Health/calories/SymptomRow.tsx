import { Tooltip } from '../../../shared/controls/Tooltip';
import { SymptomIcon } from './SymptomIcon';
import { Magnitude, MAGNITUDES, Symptom } from './symptoms';

type SymptomRowProps = {
  symptom: Symptom;
  magnitude?: Magnitude;
  activeLevel?: Magnitude;
  isTooltipOpen: boolean;
  cellId: (level: Magnitude) => string;
  onSelect: (level: Magnitude) => void;
};

export function SymptomRow({
  symptom,
  magnitude,
  activeLevel,
  isTooltipOpen,
  cellId,
  onSelect,
}: SymptomRowProps) {
  return (
    <Tooltip label={symptom.label} isOpen={isTooltipOpen}>
      {(triggerProps) => (
        <div {...triggerProps} className="symptom-row" role="row">
          {MAGNITUDES.map((level) => (
            <div
              key={level}
              id={cellId(level)}
              role="gridcell"
              className="symptom-level"
              aria-label={`${symptom.label} ${level}`}
              aria-selected={magnitude === level}
              data-active={activeLevel === level || undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(level)}
            >
              <SymptomIcon symptom={symptom} magnitude={level} width="40px" />
            </div>
          ))}
        </div>
      )}
    </Tooltip>
  );
}
