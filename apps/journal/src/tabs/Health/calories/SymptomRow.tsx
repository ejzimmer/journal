import { SymptomLevel } from './SymptomLevel';
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
    <div className="symptom-row" role="row">
      {MAGNITUDES.map((level) => (
        <SymptomLevel
          key={level}
          id={cellId(level)}
          symptom={symptom}
          level={level}
          isSelected={magnitude === level}
          isActive={activeLevel === level}
          isTooltipOpen={isTooltipOpen && activeLevel === level}
          onSelect={() => onSelect(level)}
        />
      ))}
    </div>
  );
}
