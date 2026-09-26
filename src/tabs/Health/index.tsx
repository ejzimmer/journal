import './index.css';
import { ExerciseTracker } from './ExerciseTracker';
import { Calories } from './calories/Calories';
import { useHealthDataMigration } from './useHealthDataMigration';

export function Health() {
  useHealthDataMigration();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Calories />
      <ExerciseTracker />
    </div>
  );
}
