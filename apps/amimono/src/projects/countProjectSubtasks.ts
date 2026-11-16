import { getSockProgress } from '../socks/getSockProgress';
import { countKnittedSections, SECTIONS_PER_PAIR } from '../socks/sockProgress';
import { Project } from './types';

export function countProjectSubtasks(project: Project) {
  const subtasks = Object.values(project.subtasks ?? {});
  const doneSubtaskCount = subtasks.filter(
    ({ status }) => status === 'done',
  ).length;
  const socks = getSockProgress(project);
  const knittedSectionCount = socks ? countKnittedSections(socks) : 0;
  const hasStartedSocks = knittedSectionCount > 0;

  return {
    doneCount: doneSubtaskCount + knittedSectionCount,
    totalCount: subtasks.length + (hasStartedSocks ? SECTIONS_PER_PAIR : 0),
  };
}
