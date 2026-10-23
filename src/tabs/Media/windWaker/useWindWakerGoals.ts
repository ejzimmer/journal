import { useStorageContext } from '../../../shared/FirebaseContext';
import { WIND_WAKER_PATH } from './windWakerPath';

export function useWindWakerGoals() {
  const { useValue, setValue } = useStorageContext();
  const { value: goals } = useValue<Record<string, any>>(WIND_WAKER_PATH);

  const updateGoal = (key: string, value: any) =>
    setValue(`${WIND_WAKER_PATH}/${key}`, value);

  return { goals, updateGoal };
}
