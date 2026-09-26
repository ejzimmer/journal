import { useMemo } from 'react';
import { useStorageContext } from '../../shared/FirebaseContext';
import { Exercise, EXERCISES_PATH } from '../../shared/types';
import { ExerciseRow } from './ExerciseRow';
import { AddExerciseRow } from './AddExerciseRow';
import './ExerciseTracker.css';

export function ExerciseTracker() {
  const { useValue, addItem } = useStorageContext();
  const { value } = useValue<Record<string, Exercise>>(EXERCISES_PATH);

  const exercises = useMemo(() => Object.values(value ?? {}), [value]);
  const numberOfUpdateColumns = Math.max(0, ...exercises.map(countUpdates)) + 1;

  return (
    <table className="exercise-tracker">
      <tbody>
        {exercises.map((exercise) => (
          <ExerciseRow
            key={exercise.id}
            exercise={exercise}
            numberOfUpdateColumns={numberOfUpdateColumns}
          />
        ))}
        <AddExerciseRow
          onAdd={(name) => addItem<Exercise>(EXERCISES_PATH, { name })}
        />
      </tbody>
    </table>
  );
}

const countUpdates = (exercise: Exercise) =>
  Object.keys(exercise.updates ?? {}).length;
