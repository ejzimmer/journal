import { SymptomIcon } from './SymptomIcon';
import { Magnitude, MAGNITUDES, Symptom } from './symptoms';

type SymptomRowProps = {
  symptom: Symptom;
  magnitude?: Magnitude;
  onChange: (magnitude: Magnitude | undefined) => void;
};

export function SymptomRow({ symptom, magnitude, onChange }: SymptomRowProps) {
  return (
    <div className="symptom-row" role="group" aria-label={symptom.label}>
      {MAGNITUDES.map((level) => (
        <button
          key={level}
          type="button"
          className="symptom-level"
          aria-label={`${symptom.label} ${level}`}
          aria-pressed={magnitude === level}
          onClick={() => onChange(magnitude === level ? undefined : level)}
        >
          <SymptomIcon symptom={symptom} magnitude={level} width="22px" />
        </button>
      ))}
    </div>
  );
}
