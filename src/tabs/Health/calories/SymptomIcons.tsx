import { SymptomIcon } from './SymptomIcon';
import { LoggedSymptom } from './symptoms';
import { splitIntoRows } from './symptomRows';
import './SymptomIcons.css';

type SymptomIconsProps = {
  symptoms: LoggedSymptom[];
  iconSize: number;
};

export function SymptomIcons({ symptoms, iconSize }: SymptomIconsProps) {
  if (!symptoms.length) {
    return null;
  }

  return (
    <div className="symptom-icons">
      {splitIntoRows(symptoms).map((row) => (
        <div key={row[0].symptom.id} className="symptom-icon-row">
          {row.map(({ symptom, magnitude }) => (
            <span
              key={symptom.id}
              role="img"
              aria-label={
                symptom.unlevelled
                  ? symptom.label
                  : `${symptom.label} ${magnitude}`
              }
            >
              <SymptomIcon
                symptom={symptom}
                magnitude={magnitude}
                width={`${iconSize}px`}
              />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
