import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToday } from 'shared/dates';
import { renderWithStorage } from 'shared/storageContextTestUtils';
import { CalendarTask, CALENDAR_KEY } from '../../../types';
import { CategoriesContext } from '../../Todo/TodoCategoriesProvider';
import { DueDateTaskPill } from './DueDateTaskPill';

const task: CalendarTask = {
  id: 'rent',
  parentId: CALENDAR_KEY,
  position: 0,
  description: 'Pay rent',
  category: '🛒',
  dueDate: '2026-08-10',
  status: 'ready',
  statusUpdateDate: '2026-08-01',
};

function renderPill(calendarTask: CalendarTask = task) {
  const addItem = jest.fn();
  const updateItem = jest.fn();
  const deleteItem = jest.fn();
  renderWithStorage(
    <CategoriesContext.Provider value={['🛒', '📓']}>
      <DueDateTaskPill task={calendarTask} />
    </CategoriesContext.Provider>,
    { value: { addItem, updateItem, deleteItem } },
  );

  return { addItem, updateItem, deleteItem };
}

describe('DueDateTaskPill', () => {
  describe('due date colour', () => {
    // 2026-10-28 is a Wednesday
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2026-10-28T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe.each([
      ['in the past', '2026-10-27', 'overdue'],
      ['today', '2026-10-28', 'due-today'],
      ['later this week', '2026-11-01', 'this-week'],
      ['next week', '2026-11-02', 'later'],
    ])('when the task is due %s', (_, dueDate, dateClass) => {
      it(`marks the date as ${dateClass}`, () => {
        renderPill({ ...task, dueDate });

        expect(screen.getByText(/^\d\d \w{3}$/)).toHaveClass(dateClass);
      });
    });

    describe('when the task is finished', () => {
      it('fades the date whenever it is due', () => {
        renderPill({ ...task, dueDate: '2026-10-27', status: 'finished' });

        expect(screen.getByText('27 Oct')).toHaveClass('finished');
      });
    });
  });

  describe('when the task is ready', () => {
    describe('and the user ticks it off', () => {
      describe('and it repeats', () => {
        const repeatingTask: CalendarTask = {
          ...task,
          dueDate: '2026-08-12',
          repeats: true,
        };

        it('finishes it and adds a repeating copy due a week after its current due date', async () => {
          const user = userEvent.setup();
          const { addItem, updateItem } = renderPill(repeatingTask);

          await user.click(screen.getByLabelText('Pay rent done'));

          expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
            ...repeatingTask,
            status: 'finished',
            statusUpdateDate: getToday(),
            repeats: false,
          });
          expect(addItem).toHaveBeenCalledWith(CALENDAR_KEY, {
            parentId: CALENDAR_KEY,
            position: 0,
            description: 'Pay rent',
            category: '🛒',
            dueDate: '2026-08-19',
            status: 'ready',
            statusUpdateDate: getToday(),
            repeats: true,
          });
        });
      });

      describe("and it doesn't repeat", () => {
        it('finishes the task without adding another', async () => {
          const user = userEvent.setup();
          const { addItem, updateItem } = renderPill();

          await user.click(screen.getByLabelText('Pay rent done'));

          expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
            ...task,
            status: 'finished',
            statusUpdateDate: getToday(),
          });
          expect(addItem).not.toHaveBeenCalled();
        });
      });
    });

    describe('and the user pushes the pause button', () => {
      it('pauses the task', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();

        await user.click(
          screen.getByRole('button', { name: 'Pause Pay rent' }),
        );

        expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
          ...task,
          status: 'paused',
          statusUpdateDate: getToday(),
        });
      });
    });
  });

  describe('when the task is paused', () => {
    const pausedTask: CalendarTask = { ...task, status: 'paused' };

    it('shows the pause button pushed in', () => {
      renderPill(pausedTask);

      expect(
        screen.getByRole('button', { name: 'Pause Pay rent' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    describe('and the user pushes the pause button again', () => {
      it('makes the task ready again', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill(pausedTask);

        await user.click(
          screen.getByRole('button', { name: 'Pause Pay rent' }),
        );

        expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
          ...pausedTask,
          status: 'ready',
          statusUpdateDate: getToday(),
        });
      });
    });

    describe('and the user ticks it off', () => {
      it('finishes the task', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill(pausedTask);

        await user.click(screen.getByLabelText('Pay rent done'));

        expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
          ...pausedTask,
          status: 'finished',
          statusUpdateDate: getToday(),
        });
      });
    });
  });

  describe('when the task is finished', () => {
    describe('and the user unticks it', () => {
      it('makes the task ready again', async () => {
        const user = userEvent.setup();
        const finishedTask: CalendarTask = { ...task, status: 'finished' };
        const { updateItem } = renderPill(finishedTask);

        await user.click(screen.getByLabelText('Pay rent done'));

        expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
          ...finishedTask,
          status: 'ready',
          statusUpdateDate: getToday(),
        });
      });
    });
  });

  describe('in edit mode', () => {
    describe('when the user changes the description and presses Enter', () => {
      it('saves the new description', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();

        await user.click(screen.getByRole('button', { name: 'Pay rent' }));
        const input = screen.getByRole('textbox', { name: 'Description' });
        await user.clear(input);
        await user.type(input, 'Pay rent and bills{Enter}');

        expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
          ...task,
          description: 'Pay rent and bills',
        });
      });
    });

    describe('when the user changes the due date and presses Enter', () => {
      it('saves the new due date', async () => {
        const user = userEvent.setup();
        const { updateItem } = renderPill();

        await user.click(screen.getByRole('button', { name: 'Pay rent' }));
        const dateInput = screen.getByLabelText('Due date');
        await user.clear(dateInput);
        await user.type(dateInput, '2026-08-15');
        await user.keyboard('{Enter}');

        expect(updateItem).toHaveBeenCalledWith(CALENDAR_KEY, {
          ...task,
          dueDate: '2026-08-15',
        });
      });
    });

    describe('when the user clears the description and presses Enter', () => {
      it('deletes the task', async () => {
        const user = userEvent.setup();
        const { deleteItem } = renderPill();

        await user.click(screen.getByRole('button', { name: 'Pay rent' }));
        await user.clear(screen.getByRole('textbox', { name: 'Description' }));
        await user.keyboard('{Enter}');

        expect(deleteItem).toHaveBeenCalledWith(CALENDAR_KEY, task);
      });
    });

    describe('when the user presses Escape', () => {
      it('closes the editor', async () => {
        const user = userEvent.setup();
        renderPill();

        await user.click(screen.getByRole('button', { name: 'Pay rent' }));
        const input = screen.getByRole('textbox', { name: 'Description' });
        await user.keyboard('{Escape}');

        expect(input).not.toBeInTheDocument();
      });
    });
  });
});
