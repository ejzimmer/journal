import { getNextPosition } from '../../shared/drag-and-drop/utils';
import { WorkTask } from './types';

export function getAppendPosition(list?: WorkTask): number {
  return getNextPosition(Object.values(list?.items ?? {}));
}
