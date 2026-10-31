import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DueDateTask } from './DueDateTask';
import { CategoriesContext } from '..';
import { CalendarTask } from '../../../shared/types';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';
import { getToday } from '../../../shared/dates';

const task: CalendarTask = {
  id: '1',
  parentId: 'calendar',
  position: 0,
  description: 'Pay rent',
  category: '🛒',
  dueDate: '2026-08-10',
  status: 'ready',
  statusUpdateDate: getToday(),
};

describe('DueDateTask', () => {
  describe('due date colour', () => {
    // 2026-10-28 is a Wednesday
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-10-28T12:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const renderTaskDue = (dueDate: string) =>
      renderWithStorage(
        <CategoriesContext.Provider value={['🛒']}>
          <DueDateTask task={{ ...task, dueDate }} />
        </CategoriesContext.Provider>,
      );

    describe.each([
      ['in the past', '2026-10-27', 'overdue'],
      ['today', '2026-10-28', 'overdue'],
      ['later this week', '2026-11-01', 'this-week'],
      ['next week', '2026-11-02', 'later'],
    ])('when the task is due %s', (_, dueDate, dateClass) => {
      it(`marks the date as ${dateClass}`, () => {
        renderTaskDue(dueDate);

        expect(screen.getByRole('button', { name: /^Due date/ })).toHaveClass(
          dateClass,
        );
      });
    });
  });

  describe('when the user edits the description and presses Enter', () => {
    it('saves the new description, not the original one', async () => {
      const user = userEvent.setup();
      const updateItem = jest.fn();
      renderWithStorage(
        <CategoriesContext.Provider value={['🛒', '📓']}>
          <DueDateTask task={task} />
        </CategoriesContext.Provider>,
        { value: { updateItem } },
      );

      await user.click(screen.getByText('Pay rent'));
      const input = screen.getByRole('textbox', { name: 'Description' });
      await user.clear(input);
      await user.type(input, 'Pay rent and bills{Enter}');

      expect(updateItem).toHaveBeenCalledWith(
        'today/暦',
        expect.objectContaining({ description: 'Pay rent and bills' }),
      );
    });
  });

  describe('when the user clears the description', () => {
    it('deletes the task instead of saving an empty description', async () => {
      const user = userEvent.setup();
      const updateItem = jest.fn();
      const deleteItem = jest.fn();
      renderWithStorage(
        <CategoriesContext.Provider value={['🛒', '📓']}>
          <DueDateTask task={task} />
        </CategoriesContext.Provider>,
        { value: { updateItem, deleteItem } },
      );

      await user.click(screen.getByText('Pay rent'));
      const input = screen.getByRole('textbox', { name: 'Description' });
      await user.clear(input);
      await user.keyboard('{Enter}');

      expect(deleteItem).toHaveBeenCalledWith('today/暦', task);
      expect(updateItem).not.toHaveBeenCalled();
    });
  });

  describe('when the user finishes the task', () => {
    describe('and it repeats', () => {
      const repeatingTask: CalendarTask = {
        ...task,
        dueDate: '2026-08-12',
        repeats: true,
      };

      it('finishes it and adds a repeating copy due a week after its current due date', async () => {
        const user = userEvent.setup();
        const addItem = jest.fn();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🛒', '📓']}>
            <DueDateTask task={repeatingTask} />
          </CategoriesContext.Provider>,
          { value: { addItem, updateItem } },
        );

        await user.click(screen.getByDisplayValue('finished'));

        expect(updateItem).toHaveBeenCalledWith('today/暦', {
          ...repeatingTask,
          status: 'finished',
          repeats: false,
        });
        expect(addItem).toHaveBeenCalledWith('today/暦', {
          parentId: 'calendar',
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
        const addItem = jest.fn();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🛒', '📓']}>
            <DueDateTask task={task} />
          </CategoriesContext.Provider>,
          { value: { addItem, updateItem } },
        );

        await user.click(screen.getByDisplayValue('finished'));

        expect(updateItem).toHaveBeenCalledWith('today/暦', {
          ...task,
          status: 'finished',
        });
        expect(addItem).not.toHaveBeenCalled();
      });
    });
  });
});
