import './index.css';
import { ExerciseTracker } from './ExerciseTracker';
import { Calories } from './calories/Calories';
import { HealthStorageProvider } from './HealthStorageContext';

export function Health() {
  return (
    <HealthStorageProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Calories />
        <ExerciseTracker />
      </div>
    </HealthStorageProvider>
  );
}
