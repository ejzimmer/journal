import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateDaysAgo, getToday } from 'shared/dates';
import { ContextType } from 'shared/FirebaseContext';
import { renderWithStorage } from 'shared/storageContextTestUtils';
import { WEEKLY_KEY, WeeklyTask } from '../../../types';
import { CategoriesContext } from '../../Todo/TodoCategoriesProvider';
import { WeeklyTaskPill } from './WeeklyTaskPill';

const task: WeeklyTask = {
  id: 'strength',
  description: 'Strength training',
  category: '💪',
  parentId: WEEKLY_KEY,
  position: 0,
  frequency: 3,
  completed: [getDateDaysAgo(4), getDateDaysAgo(2)],
};

function renderPill(
  weeklyTask: WeeklyTask = task,
  storage: Partial<ContextType> = {},
) {
  const updateItem = jest.fn();
  const deleteItem = jest.fn();
  renderWithStorage(
    <CategoriesContext.Provider value={['🧘', '💪']}>
      <WeeklyTaskPill task={weeklyTask} />
    </CategoriesContext.Provider>,
    { value: { updateItem, deleteItem, ...storage } },
  );

  return { updateItem, deleteItem };
}

describe('WeeklyTaskPill', () => {
  describe('in view mode', () => {
    it('shows how many times the task has been done out of how many are needed', () => {
      renderPill();

      expect(
        screen.getByRole('group', { name: 'Strength training: 2 of 3 done' }),
      ).toBeInTheDocument();
    });

    describe('when the task has been done more times than needed', () => {
      it('counts every done, not just the ones needed', () => {
        renderPill({
          ...task,
          completed: [...task.completed!, getDateDaysAgo(1), getToday()],
        });

        expect(
          screen.getByRole('group', {
            name: 'Strength training: 4 of 3 done',
          }),
        ).toBeInTheDocument();
      });
    });

    describe('when the user clicks the empty part of the meter', () => {
      it('adds a done for today', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();

        await user.click(screen.getByRole('button', { name: 'Mark done' }));

        expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
          ...task,
          completed: [...task.completed!, getToday()],
        });
      });
    });

    describe('when the user clicks the filled part of the meter', () => {
      it('removes the most recent done', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();

        await user.click(screen.getByRole('button', { name: 'Undo' }));

        expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
          ...task,
          completed: [task.completed![0]],
        });
      });
    });

    describe('when the task has been done enough times', () => {
      it('leaves undo as the only thing the meter can do', () => {
        renderPill({ ...task, completed: [...task.completed!, getToday()] });

        const meter = screen.getByRole('group', {
          name: 'Strength training: 3 of 3 done',
        });
        expect(
          within(meter)
            .getAllByRole('button')
            .map((button) => button.getAttribute('aria-label')),
        ).toEqual(['Undo']);
      });

      describe('and the user opens the emoji menu and picks add today', () => {
        it('adds another done for today on top of the full meter', async () => {
          const user = userEvent.setup();
          const fullTask = {
            ...task,
            completed: [...task.completed!, getDateDaysAgo(1)],
          };
          const { updateItem } = renderPill(fullTask);

          await user.click(screen.getByRole('button', { name: '💪' }));
          await user.click(screen.getByRole('menuitem', { name: 'Add today' }));

          expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
            ...fullTask,
            completed: [...fullTask.completed, getToday()],
          });
        });
      });
    });

    describe('when the task has never been done', () => {
      it('leaves marking done as the only thing the meter can do', () => {
        renderPill({ ...task, completed: [] });

        const meter = screen.getByRole('group', {
          name: 'Strength training: 0 of 3 done',
        });
        expect(
          within(meter)
            .getAllByRole('button')
            .map((button) => button.getAttribute('aria-label')),
        ).toEqual(['Mark done']);
      });
    });

    describe('when the user opens the emoji menu', () => {
      describe('and picks add today', () => {
        it('adds a done for today', async () => {
          const user = userEvent.setup();
          const { updateItem } = renderPill();

          await user.click(screen.getByRole('button', { name: '💪' }));
          await user.click(screen.getByRole('menuitem', { name: 'Add today' }));

          expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
            ...task,
            completed: [...task.completed!, getToday()],
          });
        });
      });

      describe('and picks add yesterday', () => {
        it('adds a done for yesterday', async () => {
          const user = userEvent.setup();
          const { updateItem } = renderPill();

          await user.click(screen.getByRole('button', { name: '💪' }));
          await user.click(
            screen.getByRole('menuitem', { name: 'Add yesterday' }),
          );

          expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
            ...task,
            completed: [...task.completed!, getDateDaysAgo(1)],
          });
        });
      });

      describe('and enters a date', () => {
        it('adds a done for that date', async () => {
          const user = userEvent.setup();
          const { updateItem } = renderPill();

          await user.click(screen.getByRole('button', { name: '💪' }));
          const dateInput = screen.getByLabelText('Date');
          await user.clear(dateInput);
          await user.type(dateInput, getDateDaysAgo(3));
          await user.keyboard('{Enter}');

          expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
            ...task,
            completed: [...task.completed!, getDateDaysAgo(3)],
          });
        });
      });
    });

    describe('when the user clicks the description', () => {
      it('swaps the meter for inputs holding the task details', async () => {
        const user = userEvent.setup();
        renderPill();

        const meter = screen.getByRole('group', {
          name: 'Strength training: 2 of 3 done',
        });
        await user.click(
          screen.getByRole('button', { name: 'Strength training' }),
        );

        expect(meter).not.toBeInTheDocument();
        expect(
          screen.getByRole('textbox', { name: 'Description' }),
        ).toHaveValue('Strength training');
        expect(
          screen.getByRole('spinbutton', { name: 'Frequency' }),
        ).toHaveValue(3);
      });
    });
  });

  describe('in edit mode', () => {
    const startEditing = async (user: ReturnType<typeof userEvent.setup>) => {
      await user.click(
        screen.getByRole('button', { name: 'Strength training' }),
      );
    };

    describe('when the user changes the description and frequency and presses Enter', () => {
      it('saves both and returns to the meter', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();
        await startEditing(user);

        const description = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.clear(description);
        await user.type(description, 'Strength & mobility');
        const frequency = screen.getByRole('spinbutton', { name: 'Frequency' });
        await user.clear(frequency);
        await user.type(frequency, '4');
        await user.keyboard('{Enter}');

        expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
          ...task,
          description: 'Strength & mobility',
          frequency: 4,
        });
        expect(description).not.toBeInTheDocument();
        expect(
          screen.getByRole('group', { name: 'Strength training: 2 of 3 done' }),
        ).toBeInTheDocument();
      });
    });

    describe('when the user clears the frequency and presses Enter', () => {
      it('keeps the old frequency', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();
        await startEditing(user);

        const description = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.type(description, ' at the gym');
        await user.clear(screen.getByRole('spinbutton', { name: 'Frequency' }));
        await user.keyboard('{Enter}');

        expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
          ...task,
          description: 'Strength training at the gym',
          frequency: 3,
        });
      });
    });

    describe('when the user clears the description and presses Enter', () => {
      it('deletes the task', async () => {
        const user = userEvent.setup();
        const { deleteItem } = renderPill();
        await startEditing(user);

        await user.clear(screen.getByRole('textbox', { name: 'Description' }));
        await user.keyboard('{Enter}');

        expect(deleteItem).toHaveBeenCalledWith(WEEKLY_KEY, task);
      });
    });

    describe('when the user changes the description and presses Escape', () => {
      it('returns to the meter without saving', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();
        await startEditing(user);

        const description = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.type(description, ' at the gym');
        await user.keyboard('{Escape}');

        expect(description).not.toBeInTheDocument();
        expect(
          screen.getByRole('group', { name: 'Strength training: 2 of 3 done' }),
        ).toBeInTheDocument();
        expect(updateItem).not.toHaveBeenCalled();
      });
    });

    describe('when the user picks a new category', () => {
      it('saves the category and returns to the meter', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();
        await startEditing(user);

        const description = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: '🧘' }));

        expect(updateItem).toHaveBeenCalledWith(WEEKLY_KEY, {
          ...task,
          category: '🧘',
        });
        expect(description).not.toBeInTheDocument();
      });
    });
  });
});
