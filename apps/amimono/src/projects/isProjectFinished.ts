import { countProjectSubtasks } from './countProjectSubtasks';
import { Project } from './types';

export function isProjectFinished(project: Project) {
  const { doneCount, totalCount } = countProjectSubtasks(project);
  return totalCount > 0 && doneCount === totalCount;
}
