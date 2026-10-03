import { useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ExerciseClass } from '../../shared/types';
import { TickIcon } from '../../shared/icons/Tick';
import { useHealthStorage } from './HealthStorageContext';
import { SetClass } from './SetClass';
import { WeeklyClass } from './WeeklyClass';
import { isClassDone } from './isClassDone';

type ExerciseClassCardProps = {
  exerciseClass: ExerciseClass;
  countSetClassColumns: (total: number) => number;
};

export function ExerciseClassCard({
  exerciseClass,
  countSetClassColumns,
}: ExerciseClassCardProps) {
  const { updateClass } = useHealthStorage();
  const [isShowingSessions, setIsShowingSessions] = useState(false);
  const firstSessionRef = useRef<HTMLInputElement>(null);
  const shouldFocusTickRef = useRef(false);
  const nameId = useId();

  const showSessions = () => {
    flushSync(() => setIsShowingSessions(true));
    firstSessionRef.current?.focus();
  };

  const saveClass = (updated: ExerciseClass) => {
    if (isClassDone(updated)) {
      shouldFocusTickRef.current = true;
      setIsShowingSessions(false);
    }
    updateClass(updated);
  };

  const focusTickAfterFinishing = (tick: HTMLButtonElement | null) => {
    if (tick && shouldFocusTickRef.current) {
      shouldFocusTickRef.current = false;
      tick.focus();
    }
  };

  return (
    <li className="exercise-class" aria-labelledby={nameId}>
      <div id={nameId} className="name">
        {exerciseClass.description}
      </div>
      {isClassDone(exerciseClass) && !isShowingSessions ? (
        <button
          ref={focusTickAfterFinishing}
          className="done-tick"
          aria-label={`${exerciseClass.description}: all classes done. Show classes`}
          onClick={showSessions}
        >
          <TickIcon strokeWidth="3" />
        </button>
      ) : exerciseClass.blocks.length === 1 ? (
        <SetClass
          exerciseClass={exerciseClass}
          columns={countSetClassColumns(exerciseClass.blocks[0].total)}
          onChange={saveClass}
          firstSessionRef={firstSessionRef}
        />
      ) : (
        <WeeklyClass
          exerciseClass={exerciseClass}
          onChange={saveClass}
          firstSessionRef={firstSessionRef}
        />
      )}
    </li>
  );
}
