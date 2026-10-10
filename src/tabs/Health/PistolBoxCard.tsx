import { useEffect, useId } from 'react';
import { TickIcon } from '../../shared/icons/Tick';
import { useHealthStorage } from './HealthStorageContext';
import {
  isBoxCleared,
  lowerPistolBox,
  PISTOL_BOX_LEVELS,
  raisePistolBox,
  STARTING_PISTOL_BOX_LEVEL,
} from './pistolBox';
import './PistolBoxCard.css';

export function PistolBoxCard() {
  const {
    pistolBoxLevel: level = STARTING_PISTOL_BOX_LEVEL,
    updatePistolBoxLevel,
  } = useHealthStorage();
  const nameId = useId();

  useEffect(() => {
    const raiseOnUndo = (event: KeyboardEvent) => {
      const raisedLevel = raisePistolBox(level);
      if (
        raisedLevel === level ||
        !isUndoShortcut(event) ||
        isEditing(event.target)
      ) {
        return;
      }
      event.preventDefault();
      updatePistolBoxLevel(raisedLevel);
    };
    document.addEventListener('keydown', raiseOnUndo);
    return () => document.removeEventListener('keydown', raiseOnUndo);
  }, [level, updatePistolBoxLevel]);

  const { mats, blocks } = PISTOL_BOX_LEVELS[level];

  return (
    <li className="tracker-card pistol-box" aria-labelledby={nameId}>
      <div id={nameId} className="name">
        Pistol squat
      </div>
      {isBoxCleared(level) ? (
        <div className="cleared" role="img" aria-label="No box left">
          <TickIcon strokeWidth="3" />
        </div>
      ) : (
        <button
          className="stack"
          aria-label="Lower box"
          onClick={() => updatePistolBoxLevel(lowerPistolBox(level))}
        >
          {blocks
            .map((pose, index) => (
              <div key={`block-${index}`} className={`block ${pose}`} />
            ))
            .reverse()}
          {Array.from({ length: mats }, (_, index) => (
            <div key={`mat-${index}`} className="mat" />
          ))}
        </button>
      )}
    </li>
  );
}

function isUndoShortcut(event: KeyboardEvent) {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.key.toLowerCase() === 'z'
  );
}

function isEditing(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}
