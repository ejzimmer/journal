import { Project } from '../projects/types';
import { NEW_SOCK_PROGRESS } from './sockProgress';

export function getSockProgress(project: Project) {
  if (project.type !== 'socks') return undefined;
  return project.socks ?? NEW_SOCK_PROGRESS;
}
