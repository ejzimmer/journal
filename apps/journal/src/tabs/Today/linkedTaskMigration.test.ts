import { getToday } from 'shared/dates';
import { DailyTask, ONCE_KEY, ProjectDetails, PROJECTS_KEY } from '../../types';
import { SubtaskSlot, TODAY_SLOTS_KEY } from 'shared/todaySlots/types';
import { createLinkedTaskMigration } from './linkedTaskMigration';

const subtaskPath = (id: string) => `${PROJECTS_KEY}/shelves/subtasks/${id}`;

const createCopy = (
  id: string,
  linkedTask: string | undefined,
  status: DailyTask['status'] = 'ready',
): DailyTask => ({
  id,
  description: `Put up the shelves: ${id}`,
  category: '🚚',
  parentId: ONCE_KEY,
  position: 0,
  type: '一度',
  status,
  lastCompleted: getToday(),
  linkedTask,
});

const createSubtaskSlot = (id: string, position: number): SubtaskSlot => ({
  id,
  position,
  projectPath: `${PROJECTS_KEY}/shelves`,
  subtaskPath: subtaskPath(id),
});

const indexById = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]));

describe('migrating copied subtasks into Today slots', () => {
  describe('when an open copy links to a subtask and a slot is free', () => {
    it('deletes the copy and puts the subtask in the next slot', () => {
      expect(
        createLinkedTaskMigration({
          onceTasks: indexById([createCopy('drill', subtaskPath('drill'))]),
          slots: indexById([createSubtaskSlot('paint', 0)]),
        }),
      ).toEqual({
        [`${ONCE_KEY}/drill`]: null,
        [`${TODAY_SLOTS_KEY}/drill`]: {
          id: 'drill',
          position: 1,
          projectPath: `${PROJECTS_KEY}/shelves`,
          subtaskPath: subtaskPath('drill'),
        },
      });
    });
  });

  describe('when more open copies are linked than there are free slots', () => {
    it('fills the free slots and keeps the rest as plain one-off tasks', () => {
      const updates = createLinkedTaskMigration({
        onceTasks: indexById([
          createCopy('drill', subtaskPath('drill')),
          createCopy('screws', subtaskPath('screws')),
        ]),
        slots: indexById([
          createSubtaskSlot('paint', 0),
          createSubtaskSlot('sand', 1),
        ]),
      });

      expect(updates).toEqual({
        [`${ONCE_KEY}/drill`]: null,
        [`${TODAY_SLOTS_KEY}/drill`]: expect.objectContaining({ position: 2 }),
        [`${ONCE_KEY}/screws/linkedTask`]: null,
      });
    });
  });

  describe('when the linked subtask is already in a slot', () => {
    it('deletes the copy', () => {
      expect(
        createLinkedTaskMigration({
          onceTasks: indexById([createCopy('copy', subtaskPath('paint'))]),
          slots: indexById([createSubtaskSlot('paint', 0)]),
        }),
      ).toEqual({ [`${ONCE_KEY}/copy`]: null });
    });
  });

  describe('when the copy is already finished', () => {
    it('keeps it as a plain one-off task', () => {
      expect(
        createLinkedTaskMigration({
          onceTasks: indexById([
            createCopy('drill', subtaskPath('drill'), 'finished'),
          ]),
        }),
      ).toEqual({ [`${ONCE_KEY}/drill/linkedTask`]: null });
    });
  });

  describe('when a copy that was moved into a slot links to a subtask', () => {
    it('turns the slot into a link to that subtask', () => {
      const copy = {
        ...createCopy('drill', subtaskPath('drill')),
        position: 2,
      };

      expect(createLinkedTaskMigration({ slots: { drill: copy } })).toEqual({
        [`${TODAY_SLOTS_KEY}/drill`]: {
          id: 'drill',
          position: 2,
          projectPath: `${PROJECTS_KEY}/shelves`,
          subtaskPath: subtaskPath('drill'),
        },
      });
    });
  });

  describe('when a copy links to a whole project', () => {
    it('keeps it as a plain one-off task', () => {
      expect(
        createLinkedTaskMigration({
          onceTasks: indexById([createCopy('quilt', `${PROJECTS_KEY}/quilt`)]),
        }),
      ).toEqual({ [`${ONCE_KEY}/quilt/linkedTask`]: null });
    });
  });

  describe('when projects and subtasks still hold link ids', () => {
    it('clears them', () => {
      const shelves: ProjectDetails = {
        id: 'shelves',
        parentId: PROJECTS_KEY,
        position: 0,
        description: 'Put up the shelves',
        category: '🚚',
        linkedTaskId: 'old-project-copy',
        subtasks: {
          drill: {
            id: 'drill',
            description: 'Borrow a drill',
            category: '🚚',
            position: 0,
            status: 'ready',
            linkedId: 'old-subtask-copy',
          },
        },
      };

      expect(createLinkedTaskMigration({ projects: { shelves } })).toEqual({
        [`${PROJECTS_KEY}/shelves/linkedTaskId`]: null,
        [`${PROJECTS_KEY}/shelves/subtasks/drill/linkedId`]: null,
      });
    });
  });

  describe('when nothing is linked', () => {
    it('changes nothing', () => {
      expect(
        createLinkedTaskMigration({
          onceTasks: indexById([createCopy('parcel', undefined)]),
          slots: indexById([createSubtaskSlot('paint', 0)]),
        }),
      ).toEqual({});
    });
  });
});
