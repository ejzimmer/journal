import { getSockProgress } from '../socks/getSockProgress';
import { countKnittedSections, SECTIONS_PER_PAIR } from '../socks/sockProgress';
import { Project } from './types';

export function countProjectSteps(project: Project) {
  const subtasks = Object.values(project.subtasks ?? {});
  const doneSubtaskCount = subtasks.filter(
    ({ status }) => status === 'done',
  ).length;
  const socks = getSockProgress(project);

  return {
    doneCount: doneSubtaskCount + (socks ? countKnittedSections(socks) : 0),
    totalCount: subtasks.length + (socks ? SECTIONS_PER_PAIR : 0),
  };
}
