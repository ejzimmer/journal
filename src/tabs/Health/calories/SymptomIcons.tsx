import { CSSProperties } from 'react';
import { SymptomIcon } from './SymptomIcon';
import { parseSymptoms } from './symptoms';
import './SymptomIcons.css';

const MAX_VISIBLE = 3;

type SymptomIconsProps = { trackers?: string[] };

export function SymptomIcons({ trackers }: SymptomIconsProps) {
  const symptoms = parseSymptoms(trackers);
  if (!symptoms.length) {
    return null;
  }

  const visible = symptoms.slice(0, MAX_VISIBLE);
  const hiddenCount = symptoms.length - visible.length;

  return (
    <div
      className="symptom-icons"
      style={{ '--icon-count': symptoms.length } as CSSProperties}
    >
      {symptoms.map(({ symptom, magnitude }, index) => (
        <span
          key={symptom.id}
          role="img"
          aria-label={`${symptom.label} ${magnitude}`}
          className={index >= MAX_VISIBLE ? 'overflow' : undefined}
          style={{ '--icon-index': index } as CSSProperties}
        >
          <SymptomIcon symptom={symptom} magnitude={magnitude} width="9px" />
        </span>
      ))}
      {hiddenCount > 0 && <span className="more">+{hiddenCount}</span>}
    </div>
  );
}
