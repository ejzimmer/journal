import { SymptomIcon } from './SymptomIcon';
import { MoreIcon } from './MoreIcon';
import { LoggedSymptom } from './symptoms';
import { splitIntoRows } from './symptomRows';
import './SymptomIcons.css';

const MORE = 'more';

type SymptomIconsProps = {
  symptoms: LoggedSymptom[];
  iconSize: number;
  maxIcons?: number;
};

export function SymptomIcons({
  symptoms,
  iconSize,
  maxIcons = Infinity,
}: SymptomIconsProps) {
  if (!symptoms.length) {
    return null;
  }

  const isTruncated = symptoms.length > maxIcons;
  const icons: (LoggedSymptom | typeof MORE)[] = isTruncated
    ? [...symptoms.slice(0, maxIcons - 1), MORE]
    : symptoms;

  return (
    <div className="symptom-icons">
      {splitIntoRows(icons).map((row, rowIndex) => (
        <div key={rowIndex} className="symptom-icon-row">
          {row.map((icon) =>
            icon === MORE ? (
              <MoreIcon
                key={MORE}
                hiddenCount={symptoms.length - maxIcons + 1}
                iconSize={iconSize}
              />
            ) : (
              <span
                key={icon.symptom.id}
                role="img"
                aria-label={
                  icon.symptom.unlevelled
                    ? icon.symptom.label
                    : `${icon.symptom.label} ${icon.magnitude}`
                }
              >
                <SymptomIcon
                  symptom={icon.symptom}
                  magnitude={icon.magnitude}
                  width={`${iconSize}px`}
                  onDot
                />
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  );
}
