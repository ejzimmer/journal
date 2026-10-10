import { useEffect, useId, useRef } from 'react';
import { BlockPose, PistolBox } from '../../shared/types';
import { TickIcon } from '../../shared/icons/Tick';
import { useHealthStorage } from './HealthStorageContext';
import {
  isBoxCleared,
  lowerBlock,
  removeMat,
  STARTING_PISTOL_BOX,
} from './pistolBox';
import './PistolBoxCard.css';

const BLOCK_ACTIONS: Record<BlockPose, string> = {
  end: 'Turn block on its side',
  side: 'Lay block flat',
  flat: 'Take block off',
};

export function PistolBoxCard() {
  const { pistolBox = STARTING_PISTOL_BOX, setPistolBox } = useHealthStorage();
  const historyRef = useRef<PistolBox[]>([]);
  const nameId = useId();

  const changeBox = (next: PistolBox) => {
    historyRef.current.push(pistolBox);
    setPistolBox(next);
  };

  useEffect(() => {
    const undoLastChange = (event: KeyboardEvent) => {
      const previous = historyRef.current.at(-1);
      if (!previous || !isUndoShortcut(event) || isEditing(event.target)) {
        return;
      }
      event.preventDefault();
      historyRef.current.pop();
      setPistolBox(previous);
    };
    document.addEventListener('keydown', undoLastChange);
    return () => document.removeEventListener('keydown', undoLastChange);
  }, [setPistolBox]);

  const blocks = pistolBox.blocks ?? [];

  return (
    <li className="tracker-card pistol-box" aria-labelledby={nameId}>
      <div id={nameId} className="name">
        Pistol squat
      </div>
      <div className="stack">
        {isBoxCleared(pistolBox) && (
          <div className="cleared" role="img" aria-label="No box left">
            <TickIcon strokeWidth="3" />
          </div>
        )}
        {blocks
          .map((pose, index) => (
            <button
              key={`block-${index}`}
              className={`block ${pose}`}
              aria-label={BLOCK_ACTIONS[pose]}
              onClick={() => changeBox(lowerBlock(pistolBox, index))}
            />
          ))
          .reverse()}
        {Array.from({ length: pistolBox.mats }, (_, index) => (
          <button
            key={`mat-${index}`}
            className="mat"
            aria-label="Take mat off"
            onClick={() => changeBox(removeMat(pistolBox))}
          />
        ))}
      </div>
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
