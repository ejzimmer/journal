import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithWorkStorage } from './workStorageTestUtils';
import { useUndoSubtaskDeleteShortcut } from './useUndoSubtaskDeleteShortcut';

function UndoShortcut() {
  useUndoSubtaskDeleteShortcut();
  return <input aria-label="Notes" />;
}

describe('useUndoSubtaskDeleteShortcut', () => {
  describe('pressing the undo shortcut', () => {
    it('restores the last deleted subtask with ctrl+z', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithWorkStorage(<UndoShortcut />);

      await user.keyboard('{Control>}z{/Control}');

      expect(storageContext.restoreLastDeletedSubtask).toHaveBeenCalledTimes(1);
    });

    it('restores the last deleted subtask with cmd+z', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithWorkStorage(<UndoShortcut />);

      await user.keyboard('{Meta>}z{/Meta}');

      expect(storageContext.restoreLastDeletedSubtask).toHaveBeenCalledTimes(1);
    });

    describe('with shift held', () => {
      it('leaves the subtasks alone', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithWorkStorage(<UndoShortcut />);

        await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');

        expect(storageContext.restoreLastDeletedSubtask).not.toHaveBeenCalled();
      });
    });

    describe('while typing in a text field', () => {
      it('leaves the subtasks alone', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithWorkStorage(<UndoShortcut />);
        await user.click(screen.getByRole('textbox', { name: 'Notes' }));

        await user.keyboard('{Control>}z{/Control}');

        expect(storageContext.restoreLastDeletedSubtask).not.toHaveBeenCalled();
      });
    });
  });
});
