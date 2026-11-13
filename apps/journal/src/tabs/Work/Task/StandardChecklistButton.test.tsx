import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StandardChecklistButton } from './StandardChecklistButton';
import { WorkStorageContextType } from '../WorkStorageContext';
import { renderWithWorkStorage } from '../workStorageTestUtils';
import { STANDARD_CHECKLIST, Subtask, WorkTask } from '../types';

function renderWithContext(
  subtasks?: Record<string, Subtask>,
  overrides: Partial<WorkStorageContextType> = {},
) {
  const { storageContext } = renderWithWorkStorage(
    <StandardChecklistButton listId="list-1" taskId="task-1" />,
    { getTask: () => ({ subtasks }) as WorkTask, ...overrides },
  );
  return storageContext;
}

const standardEntries = [...STANDARD_CHECKLIST.entries()];

describe('StandardChecklistButton', () => {
  describe('when the task has no subtasks', () => {
    it('adds every standard item, in the declared order', async () => {
      const user = userEvent.setup();
      const { updateSubtasksList } = renderWithContext(undefined);

      await user.click(
        screen.getByRole('button', { name: 'Add standard checklist' }),
      );

      expect(updateSubtasksList).toHaveBeenCalledTimes(1);
      expect(updateSubtasksList).toHaveBeenCalledWith(
        'list-1',
        'task-1',
        standardEntries.map(([id, description], index) => ({
          id,
          description,
          position: index,
        })),
      );
    });

    it('writes the same list for a second click before the first has synced', async () => {
      const user = userEvent.setup();
      // subtasks stays the same across both clicks, simulating a second click
      // landing before the first click's write has synced back down.
      const { updateSubtasksList } = renderWithContext(undefined);

      const button = screen.getByRole('button', {
        name: 'Add standard checklist',
      });
      await user.click(button);
      await user.click(button);

      expect(updateSubtasksList).toHaveBeenCalledTimes(2);
      expect(jest.mocked(updateSubtasksList).mock.calls[0]).toEqual(
        jest.mocked(updateSubtasksList).mock.calls[1],
      );
    });
  });

  describe('when some standard items already exist', () => {
    it('appends only the missing ones, in declared order', async () => {
      const user = userEvent.setup();
      const [testEntry, , , , buildEntry] = standardEntries;
      const existingTest = {
        id: testEntry[0],
        description: testEntry[1],
        position: 0,
      };
      const existingBuild = {
        id: buildEntry[0],
        description: buildEntry[1],
        position: 1,
      };
      const { updateSubtasksList } = renderWithContext({
        a: existingTest,
        b: existingBuild,
      });

      await user.click(
        screen.getByRole('button', { name: 'Add standard checklist' }),
      );

      const missing = standardEntries.filter(
        ([id]) => id !== testEntry[0] && id !== buildEntry[0],
      );
      expect(updateSubtasksList).toHaveBeenCalledWith('list-1', 'task-1', [
        existingTest,
        existingBuild,
        ...missing.map(([id, description], index) => ({
          id,
          description,
          position: 2 + index,
        })),
      ]);
    });
  });

  describe('when a custom subtask has the same description as a standard item', () => {
    it('still adds the standard item, with its standard id', async () => {
      const user = userEvent.setup();
      const [testEntry] = standardEntries;
      const custom = { id: 'custom-1', description: testEntry[1], position: 0 };
      const { updateSubtasksList } = renderWithContext({ a: custom });

      await user.click(
        screen.getByRole('button', { name: 'Add standard checklist' }),
      );

      expect(updateSubtasksList).toHaveBeenCalledWith('list-1', 'task-1', [
        custom,
        ...standardEntries.map(([id, description], index) => ({
          id,
          description,
          position: 1 + index,
        })),
      ]);
    });
  });

  describe('when every standard item already exists', () => {
    it('renders nothing', () => {
      const subtasks = Object.fromEntries(
        standardEntries.map(([id, description]) => [
          id,
          { id, description, position: 0 },
        ]),
      );
      const { container } = renderWithWorkStorage(
        <StandardChecklistButton listId="list-1" taskId="task-1" />,
        { getTask: () => ({ subtasks }) as WorkTask },
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
