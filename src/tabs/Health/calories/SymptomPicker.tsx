import { CSSProperties, KeyboardEvent, useId, useRef, useState } from 'react';
import { ChevronDownIcon } from '../../../shared/icons/ChevronDown';
import { SymptomIcon } from './SymptomIcon';
import { SymptomRow } from './SymptomRow';
import {
  findGridPosition,
  GridPosition,
  isArrowKey,
  moveGridPosition,
} from './symptomGrid';
import {
  Magnitude,
  MAGNITUDES,
  parseSymptoms,
  setSymptomMagnitude,
  Symptom,
  SYMPTOMS,
} from './symptoms';
import './SymptomPicker.css';

type SymptomPickerProps = {
  trackers: string[];
  onChange: (trackers: string[]) => void;
};

export function SymptomPicker({ trackers, onChange }: SymptomPickerProps) {
  const id = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<GridPosition>();
  const [isNavigatingByKeyboard, setIsNavigatingByKeyboard] = useState(false);
  const anchorName = `--symptom-anchor-${id.replace(/[^a-zA-Z0-9]/g, '')}`;
  const logged = parseSymptoms(trackers);
  const isOpen = active !== undefined;

  const cellId = (symptom: Symptom, level: Magnitude) =>
    `${id}-${symptom.id}-${level}`;

  const open = () => {
    gridRef.current?.showPopover();
    setActive(logged[0] ? findGridPosition(logged[0]) : { row: 0, column: 0 });
  };

  const close = () => {
    gridRef.current?.hidePopover();
    setIsNavigatingByKeyboard(false);
    setActive(undefined);
  };

  const toggleLevel = (symptom: Symptom, level: Magnitude) => {
    const current = logged.find((entry) => entry.symptom === symptom);
    const magnitude = current?.magnitude === level ? undefined : level;
    onChange(setSymptomMagnitude(trackers, symptom, magnitude));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isOpen) {
      if ([' ', 'Enter', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        setIsNavigatingByKeyboard(true);
        open();
      }
      return;
    }

    if (isArrowKey(event.key)) {
      setIsNavigatingByKeyboard(true);
      setActive(moveGridPosition(active, event.key));
    } else if (event.key === ' ') {
      toggleLevel(SYMPTOMS[active.row], MAGNITUDES[active.column]);
    } else if (event.key === 'Enter' || event.key === 'Escape') {
      close();
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <div
        role="combobox"
        tabIndex={0}
        className="symptom-trigger"
        aria-label="symptoms"
        aria-haspopup="grid"
        aria-controls={id}
        aria-expanded={isOpen}
        aria-activedescendant={
          active && cellId(SYMPTOMS[active.row], MAGNITUDES[active.column])
        }
        style={{ anchorName } as CSSProperties}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        onBlur={() => isOpen && close()}
      >
        {logged.length ? (
          logged.map(({ symptom, magnitude }) => (
            <SymptomIcon
              key={symptom.id}
              symptom={symptom}
              magnitude={magnitude}
              width="28px"
            />
          ))
        ) : (
          <ChevronDownIcon width="14px" />
        )}
      </div>
      <div
        ref={gridRef}
        id={id}
        popover="manual"
        role="grid"
        aria-label="symptoms"
        className="symptom-list"
        style={{ positionAnchor: anchorName } as CSSProperties}
      >
        {SYMPTOMS.map((symptom, row) => (
          <SymptomRow
            key={symptom.id}
            symptom={symptom}
            magnitude={
              logged.find((entry) => entry.symptom === symptom)?.magnitude
            }
            activeLevel={
              active?.row === row ? MAGNITUDES[active.column] : undefined
            }
            isTooltipOpen={isNavigatingByKeyboard && active?.row === row}
            cellId={(level) => cellId(symptom, level)}
            onSelect={(level) => {
              setIsNavigatingByKeyboard(false);
              setActive({ row, column: MAGNITUDES.indexOf(level) });
              toggleLevel(symptom, level);
            }}
          />
        ))}
      </div>
    </>
  );
}
