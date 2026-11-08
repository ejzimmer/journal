import { SymptomIcon } from './SymptomIcon';
import { Magnitude, MAGNITUDES, Symptom } from './symptoms';

type SymptomRowProps = {
  symptom: Symptom;
  magnitude?: Magnitude;
  activeLevel?: Magnitude;
  cellId: (level: Magnitude) => string;
  onSelect: (level: Magnitude) => void;
};

export function SymptomRow({
  symptom,
  magnitude,
  activeLevel,
  cellId,
  onSelect,
}: SymptomRowProps) {
  return (
    <div className="symptom-row" role="row">
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
  );
}
