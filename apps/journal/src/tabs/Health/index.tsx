import './index.css';
import { ExerciseTracker } from './ExerciseTracker';
import { ExerciseClasses } from './ExerciseClasses';
import { Calories } from './calories/Calories';
import { HealthStorageProvider } from './HealthStorageContext';

export function Health() {
  return (
    <HealthStorageProvider>
      <div className="health">
        <Calories />
        <ExerciseTracker />
        <ExerciseClasses />
      </div>
    </HealthStorageProvider>
  );
}
