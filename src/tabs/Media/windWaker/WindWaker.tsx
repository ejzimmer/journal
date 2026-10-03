import { useStorageContext } from '../../../shared/FirebaseContext';
import { useWindWakerMigration } from './useWindWakerMigration';
import { WindWakerGoals } from './WindWakerGoals';
import { WIND_WAKER_PATH } from './windWakerPath';

export function WindWaker() {
  const { useValue, setValue } = useStorageContext();
  const { value: goals } = useValue<Record<string, any>>(WIND_WAKER_PATH);
  useWindWakerMigration();

  if (!goals) {
    return null;
  }

  return (
    <div className="wind-waker">
      <WindWakerGoals
        goals={goals}
        updateGoal={(key, value) =>
          setValue(`${WIND_WAKER_PATH}/${key}`, value)
        }
      />
    </div>
  );
}
