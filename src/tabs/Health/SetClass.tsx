import { CSSProperties, Ref } from 'react';
import { ExerciseClass } from '../../shared/types';
import { Sessions } from './Sessions';

type SetClassProps = {
  exerciseClass: ExerciseClass;
  columns: number;
  onChange: (exerciseClass: ExerciseClass) => void;
  firstSessionRef: Ref<HTMLInputElement>;
};

export function SetClass({
  exerciseClass,
  columns,
  onChange,
  firstSessionRef,
}: SetClassProps) {
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
