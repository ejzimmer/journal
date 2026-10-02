import { useHealthStorage } from './HealthStorageContext';
import { ExerciseRow } from './ExerciseRow';
import { AddExercise } from './AddExercise';
import './ExerciseTracker.css';

export function ExerciseTracker() {
  const { exercises, addExercise } = useHealthStorage();

  return (
    <div className="exercise-tracker">
      <ul aria-label="Exercises">
        {exercises.map((exercise) => (
          <ExerciseRow key={exercise.id} exercise={exercise} />
        ))}
      </ul>
      <AddExercise onAdd={addExercise} />
    </div>
  );
}
