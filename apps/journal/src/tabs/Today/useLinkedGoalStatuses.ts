import { useStorageContext } from 'shared/FirebaseContext';
import { getLinkedPath, LinkedGoal } from 'shared/dailyGoals/types';
import { DailyTaskDetails } from '../../types';
import { BaseSubtask } from 'shared/projects/types';

function useLinkedStatus(path?: string) {
  const { useValue } = useStorageContext();
  const { value, synced } = useValue<BaseSubtask | DailyTaskDetails>(path);

  return { status: value?.status, synced: !path || synced };
}

// Hooks have to be called the same number of times on every render, so this
// reads one task for each of the three daily goals.
export function useLinkedGoalStatuses(goals: LinkedGoal[]) {
  const reads = [
    useLinkedStatus(goals[0] && getLinkedPath(goals[0])),
    useLinkedStatus(goals[1] && getLinkedPath(goals[1])),
    useLinkedStatus(goals[2] && getLinkedPath(goals[2])),
  ];

  return {
    synced: reads.every((read) => read.synced),
    findStatus: (goal: LinkedGoal) => reads[goals.indexOf(goal)]?.status,
  };
}
