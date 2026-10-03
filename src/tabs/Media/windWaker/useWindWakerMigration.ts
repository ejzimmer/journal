import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { WIND_WAKER_PATH } from './windWakerPath';

export const LEGACY_GOALS_PATH = '2026/other_goals';

type LegacyWindWakerGoal = { name: string; goals: Record<string, unknown> };

const isLegacyWindWakerGoal = (goal: unknown): goal is LegacyWindWakerGoal =>
  typeof goal === 'object' &&
  goal !== null &&
  'name' in goal &&
  goal.name === 'Wind Waker' &&
  'goals' in goal;

export function createWindWakerMigration(
  legacyGoals: Record<string, unknown> = {},
): Record<string, unknown> {
  const entry = Object.entries(legacyGoals).find(([, goal]) =>
    isLegacyWindWakerGoal(goal),
  );
  if (!entry) {
    return {};
  }

  const [id, goal] = entry as [string, LegacyWindWakerGoal];
  return {
    [WIND_WAKER_PATH]: goal.goals,
    [`${LEGACY_GOALS_PATH}/${id}`]: null,
  };
}

export function useWindWakerMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: legacyGoals, synced } =
    useValue<Record<string, unknown>>(LEGACY_GOALS_PATH);

  useEffect(() => {
    if (!synced) return;

    const updates = createWindWakerMigration(legacyGoals);
    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [legacyGoals, synced, setValues]);
}
