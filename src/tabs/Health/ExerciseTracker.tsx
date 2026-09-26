import { useHealthStorage } from './HealthStorageContext';
import { ExerciseRow } from './ExerciseRow';
import { AddExerciseRow } from './AddExerciseRow';
import './ExerciseTracker.css';

export function ExerciseTracker() {
  const { exercises, addExercise } = useHealthStorage();

  const numberOfUpdateColumns =
    Math.max(
      0,
      ...exercises.map(({ updates }) => Object.keys(updates ?? {}).length),
    ) + 1;

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
        <AddExerciseRow onAdd={addExercise} />
      </tbody>
    </table>
  );
}
