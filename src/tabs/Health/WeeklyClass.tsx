import { Ref } from 'react';
import { ExerciseClass } from '../../shared/types';
import { Sessions } from './Sessions';

type WeeklyClassProps = {
  exerciseClass: ExerciseClass;
  onChange: (exerciseClass: ExerciseClass) => void;
  firstSessionRef: Ref<HTMLInputElement>;
};

export function WeeklyClass({
  exerciseClass,
  onChange,
  firstSessionRef,
}: WeeklyClassProps) {
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
