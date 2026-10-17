import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { Bike, getBikesPath } from './types';

const LEGACY_GOALS_PATH = '2026/other_goals';

type LegacyGoals = Record<string, { bikes?: Bike[] }>;

export function useBikesMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: legacyGoals } = useValue<LegacyGoals>(LEGACY_GOALS_PATH);
  const legacyBikes = Object.values(legacyGoals ?? {}).find(
    (goal) => goal.bikes,
  )?.bikes;

  useEffect(() => {
    if (legacyBikes) {
      setValues({
        [getBikesPath(2026)]: legacyBikes,
        [LEGACY_GOALS_PATH]: null,
      });
    }
  }, [legacyBikes, setValues]);
}
