import { WorkTask } from './types';

const DEPENDENT_MARKER = '^^';

export const isDependentTask = (task: WorkTask) =>
  task.description.trimStart().startsWith(DEPENDENT_MARKER);

export function findBlockerSource(tasks: WorkTask[], index: number) {
  let sourceIndex = index;
  while (sourceIndex > 0 && isDependentTask(tasks[sourceIndex])) {
    sourceIndex--;
  }
  return tasks[sourceIndex];
}
