import { CSSProperties, useId } from 'react';
import { ChevronDownIcon } from '../../../shared/icons/ChevronDown';
import { SymptomIcon } from './SymptomIcon';
import { SymptomRow } from './SymptomRow';
import { parseSymptoms, setSymptomMagnitude, SYMPTOMS } from './symptoms';
import './SymptomPicker.css';

type SymptomPickerProps = {
  trackers: string[];
  onChange: (trackers: string[]) => void;
};

export function SymptomPicker({ trackers, onChange }: SymptomPickerProps) {
  const id = useId();
  const anchorName = `--symptom-anchor-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const logged = parseSymptoms(trackers);

  return (
    <>
      <button
        type="button"
        className="symptom-trigger"
        aria-label="symptoms"
        popoverTarget={id}
        style={{ anchorName } as CSSProperties}
      >
        {logged.length ? (
          logged.map(({ symptom, magnitude }) => (
            <SymptomIcon
              key={symptom.id}
              symptom={symptom}
              magnitude={magnitude}
              width="16px"
            />
          ))
        ) : (
          <ChevronDownIcon width="14px" />
        )}
      </button>
      <div
        id={id}
        popover="auto"
        className="symptom-list"
        style={{ positionAnchor: anchorName } as CSSProperties}
      >
        {SYMPTOMS.map((symptom) => (
          <SymptomRow
            key={symptom.id}
            symptom={symptom}
            magnitude={
              logged.find((entry) => entry.symptom.id === symptom.id)?.magnitude
            }
            onChange={(magnitude) =>
              onChange(setSymptomMagnitude(trackers, symptom, magnitude))
            }
          />
        ))}
      </div>
    </>
  );
}
