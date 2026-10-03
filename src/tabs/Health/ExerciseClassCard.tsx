import { CSSProperties, Ref, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ExerciseClass } from '../../shared/types';
import { TickIcon } from '../../shared/icons/Tick';
import { useHealthStorage } from './HealthStorageContext';
import { Sessions } from './Sessions';

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

type ClassProps = {
  exerciseClass: ExerciseClass;
  onChange: (exerciseClass: ExerciseClass) => void;
  firstSessionRef: Ref<HTMLInputElement>;
};

function SetClass({
  exerciseClass,
  columns,
  onChange,
  firstSessionRef,
}: ClassProps & { columns: number }) {
  return (
    <div
      className="set-class"
      style={{ '--columns': columns } as CSSProperties}
    >
      <Sessions
        exerciseClass={exerciseClass}
        blockIndex={0}
        getSessionName={(index) => `Class ${index + 1}`}
        onChange={onChange}
        firstSessionRef={firstSessionRef}
      />
    </div>
  );
}

function WeeklyClass({ exerciseClass, onChange, firstSessionRef }: ClassProps) {
  return (
    <div className="weekly-class">
      {exerciseClass.blocks.map((week, weekIndex) => (
        <Sessions
          key={week.id}
          exerciseClass={exerciseClass}
          blockIndex={weekIndex}
          getSessionName={(index) =>
            `Week ${weekIndex + 1}, class ${index + 1}`
          }
          onChange={onChange}
          firstSessionRef={weekIndex === 0 ? firstSessionRef : undefined}
        />
      ))}
    </div>
  );
}

export function isClassDone({ blocks }: ExerciseClass) {
  return blocks.every(
    ({ total, completed }) => (completed?.length ?? 0) === total,
  );
}
