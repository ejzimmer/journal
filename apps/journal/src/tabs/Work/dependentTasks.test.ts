import { reorderTaskWithDependents } from './dependentTasks';
import { WorkTask } from './types';

const createTask = (description: string, position: number): WorkTask => ({
  id: description,
  description,
  status: 'not_started',
  parentId: 'work/list-1/items',
  lastStatusUpdate: '2026-01-01',
  position,
});

const tasks = [
  'merge it',
  '^^ deploy it',
  '^^ announce it',
  'review it',
  '^^ approve it',
  'tidy up',
].map(createTask);

const indexOf = (description: string) =>
  tasks.findIndex((task) => task.description === description);

const dragOnto = (
  dragged: string,
  target: string,
  closestEdgeOfTarget: 'top' | 'bottom',
) =>
  reorderTaskWithDependents({
    list: tasks,
    startIndex: indexOf(dragged),
    indexOfTarget: indexOf(target),
    closestEdgeOfTarget,
  }).map(({ description }) => description);

describe('reorderTaskWithDependents', () => {
  describe('dragging a task with dependent tasks', () => {
    it('moves its dependent tasks along with it', () => {
      expect(dragOnto('merge it', 'tidy up', 'bottom')).toEqual([
        'review it',
        '^^ approve it',
        'tidy up',
        'merge it',
        '^^ deploy it',
        '^^ announce it',
      ]);
    });

    describe('onto one of its own dependent tasks', () => {
      it('leaves the list as it was', () => {
        expect(dragOnto('merge it', '^^ announce it', 'bottom')).toEqual(
          tasks.map(({ description }) => description),
        );
      });
    });
  });

  describe('dragging a task between another task and its dependent tasks', () => {
    it('drops it after those dependent tasks', () => {
      expect(dragOnto('tidy up', '^^ deploy it', 'top')).toEqual([
        'merge it',
        '^^ deploy it',
        '^^ announce it',
        'tidy up',
        'review it',
        '^^ approve it',
      ]);
    });
  });

  describe('dragging a dependent task', () => {
    it('moves only that task', () => {
      expect(dragOnto('^^ approve it', 'merge it', 'bottom')).toEqual([
        'merge it',
        '^^ approve it',
        '^^ deploy it',
        '^^ announce it',
        'review it',
        'tidy up',
      ]);
    });
  });
});
