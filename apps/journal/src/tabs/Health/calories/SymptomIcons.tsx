import { LoggedSymptomIcon } from './LoggedSymptomIcon';
import { MoreIcon } from './MoreIcon';
import { LoggedSymptom } from './symptoms';
import { splitIntoRows } from './symptomRows';
import './SymptomIcons.css';

const MORE = 'more';

type SymptomIconsProps = {
  symptoms: LoggedSymptom[];
  iconSize: number;
  maxIcons?: number;
  hasTooltips?: boolean;
};

export function SymptomIcons({
  symptoms,
  iconSize,
  maxIcons = Infinity,
  hasTooltips,
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
              <LoggedSymptomIcon
                key={icon.symptom.id}
                icon={icon}
                iconSize={iconSize}
                hasTooltip={hasTooltips}
              />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
