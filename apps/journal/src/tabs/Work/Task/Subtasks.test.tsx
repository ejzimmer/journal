import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Subtasks } from './Subtasks';
import {
  WorkStorageContext,
  WorkStorageContextType,
} from '../WorkStorageContext';
import { renderWithWorkStorage } from '../workStorageTestUtils';
import { STANDARD_CHECKLIST, Subtask, WorkTask } from '../types';

function renderWithContext(
  subtasks: Record<string, Subtask> | undefined,
  overrides: Partial<WorkStorageContextType> = {},
) {
  const view = renderWithWorkStorage(
    <Subtasks subtasks={subtasks} listId="list-1" taskId="task-1" />,
    { getTask: () => ({ subtasks }) as WorkTask, ...overrides },
  );
  const rerenderWithSubtasks = (
    nextSubtasks: Record<string, Subtask> | undefined,
  ) =>
    view.rerender(
      <WorkStorageContext.Provider
        value={{
          ...view.storageContext,
          getTask: () => ({ subtasks: nextSubtasks }) as WorkTask,
        }}
      >
        <Subtasks subtasks={nextSubtasks} listId="list-1" taskId="task-1" />
      </WorkStorageContext.Provider>,
    );
  return { ...view, rerenderWithSubtasks };
}

const openEditor = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getAllByRole('button', { name: 'Edit subtasks' })[0]);

const createStandardSubtasks = (entries: [string, string][]) =>
  Object.fromEntries(
    entries.map(([id, description]) => [id, { id, description, position: 0 }]),
  );

describe('Subtasks', () => {
  describe('when there are no subtasks', () => {
    it('shows the add subtask and add standard checklist buttons', () => {
      renderWithContext(undefined);

      expect(
        screen.getByRole('button', { name: 'Add subtask' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add standard checklist' }),
      ).toBeInTheDocument();
    });

    describe('and a subtask is added', () => {
      it('replaces the add subtask button with the subtasks', () => {
        const { rerenderWithSubtasks } = renderWithContext(undefined);
        const addButton = screen.getByRole('button', { name: 'Add subtask' });

        rerenderWithSubtasks({
          a: { id: 'a', description: 'test', position: 0 },
        });

        expect(addButton).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'test' }),
        ).toBeInTheDocument();
      });
    });

    describe('and the add subtask button is clicked', () => {
      it('opens an empty edit form', async () => {
        const user = userEvent.setup();
        renderWithContext(undefined);

        await user.click(screen.getByRole('button', { name: 'Add subtask' }));

        expect(
          screen.getByRole('textbox', { name: 'Edit subtasks' }),
        ).toHaveValue('');
      });

      it('saves a comma separated list as new subtasks', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithContext(undefined);

        await user.click(screen.getByRole('button', { name: 'Add subtask' }));
        await user.type(
          screen.getByRole('textbox', { name: 'Edit subtasks' }),
          'test, review{Enter}',
        );

        expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
          'list-1',
          'task-1',
          [
            { id: expect.any(String), description: 'test', position: 0 },
            { id: expect.any(String), description: 'review', position: 1 },
          ],
        );
      });

      it('saves an empty list when the form is submitted empty', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithContext(undefined);

        await user.click(screen.getByRole('button', { name: 'Add subtask' }));
        await user.keyboard('{Enter}');

        expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
          'list-1',
          'task-1',
          [],
        );
      });

      it('closes without saving when Escape is pressed', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithContext(undefined);

        await user.click(screen.getByRole('button', { name: 'Add subtask' }));
        const input = screen.getByRole('textbox', { name: 'Edit subtasks' });
        await user.type(input, 'test');
        await user.keyboard('{Escape}');

        expect(storageContext.updateSubtasksList).not.toHaveBeenCalled();
        expect(input).not.toBeInTheDocument();
      });
    });
  });

  describe('when there are subtasks', () => {
    it('shows their descriptions in position order', () => {
      renderWithContext({
        b: { id: 'b', description: 'create PR', position: 1 },
        a: { id: 'a', description: 'test', position: 0 },
      });

      expect(
        screen
          .getAllByRole('button', { name: /test|create PR/ })
          .map((subtask) => subtask.textContent),
      ).toEqual(['test', 'create PR']);
    });

    it('wraps them in brackets and comma separators that open the editor', () => {
      renderWithContext({
        b: { id: 'b', description: 'create PR', position: 1 },
        a: { id: 'a', description: 'test', position: 0 },
      });

      expect(
        screen
          .getAllByRole('button', { name: 'Edit subtasks' })
          .map((button) => button.textContent),
      ).toEqual(['[', ', ', ']']);
    });

    it('shows the add standard checklist button', () => {
      renderWithContext({
        a: { id: 'a', description: 'test', position: 0 },
      });

      expect(
        screen.getByRole('button', { name: 'Add standard checklist' }),
      ).toBeInTheDocument();
    });

    it("deletes a subtask when it's clicked", async () => {
      const user = userEvent.setup();
      const subtask = { id: 'a', description: 'test', position: 0 };
      const { storageContext } = renderWithContext({ a: subtask });

      await user.click(screen.getByRole('button', { name: 'test' }));

      expect(storageContext.deleteSubtask).toHaveBeenCalledWith(
        'list-1',
        'task-1',
        subtask,
      );
    });

    describe('and the editor is opened', () => {
      it('prefills it with the current list', async () => {
        const user = userEvent.setup();
        renderWithContext({
          a: { id: 'a', description: 'test', position: 0 },
          b: { id: 'b', description: 'build', position: 1 },
        });

        await openEditor(user);

        expect(
          screen.getByRole('textbox', { name: 'Edit subtasks' }),
        ).toHaveValue('test, build');
      });

      it('saves the edited text as the new subtask list when Enter is pressed', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithContext({
          a: { id: 'a', description: 'test', position: 0 },
          b: { id: 'b', description: 'build', position: 1 },
        });

        await openEditor(user);
        const input = screen.getByRole('textbox', { name: 'Edit subtasks' });
        await user.clear(input);
        await user.type(input, 'test, review, build{Enter}');

        expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
          'list-1',
          'task-1',
          [
            { id: 'a', description: 'test', position: 0 },
            { id: expect.any(String), description: 'review', position: 1 },
            { id: 'b', description: 'build', position: 2 },
          ],
        );
      });

      it('filters out blank entries when saving', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithContext({
          a: { id: 'a', description: 'test', position: 0 },
        });

        await openEditor(user);
        const input = screen.getByRole('textbox', { name: 'Edit subtasks' });
        await user.clear(input);
        await user.type(input, 'test, , build,{Enter}');

        expect(storageContext.updateSubtasksList).toHaveBeenCalledWith(
          'list-1',
          'task-1',
          [
            { id: 'a', description: 'test', position: 0 },
            { id: expect.any(String), description: 'build', position: 1 },
          ],
        );
      });

      it('closes without saving when Escape is pressed', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithContext({
          a: { id: 'a', description: 'test', position: 0 },
        });

        await openEditor(user);
        const input = screen.getByRole('textbox', { name: 'Edit subtasks' });
        await user.type(input, ', extra');
        await user.keyboard('{Escape}');

        expect(storageContext.updateSubtasksList).not.toHaveBeenCalled();
        expect(input).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'test' }),
        ).toBeInTheDocument();
      });

      it('returns focus to the brackets when it closes', async () => {
        const user = userEvent.setup();
        renderWithContext({ a: { id: 'a', description: 'test', position: 0 } });

        await openEditor(user);
        await user.keyboard('{Escape}');

        expect(
          screen.getAllByRole('button', { name: 'Edit subtasks' })[0],
        ).toHaveFocus();
      });
    });
  });

  describe('when the last standard item is added', () => {
    it('removes the add standard checklist button', () => {
      const [last, ...rest] = [...STANDARD_CHECKLIST.entries()];
      const { rerenderWithSubtasks } = renderWithContext(
        createStandardSubtasks(rest),
      );
      const button = screen.getByRole('button', {
        name: 'Add standard checklist',
      });

      rerenderWithSubtasks(createStandardSubtasks([last, ...rest]));

      expect(button).not.toBeInTheDocument();
    });
  });
});
