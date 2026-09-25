import './index.css';
import { ExerciseTracker } from './ExerciseTracker';
import { Calories } from './calories/Calories';

export function Health() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Calories />
      <ExerciseTracker />
    </div>
  );
}
