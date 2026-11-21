import { useStorageContext } from 'shared/FirebaseContext';
import { BaseSubtask } from 'shared/projects/types';
import { SubtaskGoal } from 'shared/dailyGoals/types';

function useSubtaskStatus(subtaskPath?: string) {
  const { useValue } = useStorageContext();
  const { value, synced } = useValue<BaseSubtask>(subtaskPath);

  return { status: value?.status, synced: !subtaskPath || synced };
}

// Hooks have to be called the same number of times on every render, so this
// reads one subtask for each of the three daily goals.
export function useGoalSubtaskStatuses(goals: SubtaskGoal[]) {
  const reads = [
    useSubtaskStatus(goals[0]?.subtaskPath),
    useSubtaskStatus(goals[1]?.subtaskPath),
    useSubtaskStatus(goals[2]?.subtaskPath),
  ];

  return {
    synced: reads.every((read) => read.synced),
    findStatus: (goal: SubtaskGoal) => reads[goals.indexOf(goal)]?.status,
  };
}
