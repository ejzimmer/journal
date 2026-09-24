import { screen } from '@testing-library/react';
import { ThisWeekTask } from './ThisWeekTask';
import { WeeklyTask } from '../../../shared/types';
import userEvent from '@testing-library/user-event';
import { CategoriesContext } from '..';
import { getDateFromTimestamp, getToday } from '../../../shared/dates';
import { getTimestampDaysAgo } from '../../../shared/dateTestUtils';
import { ContextType } from '../../../shared/FirebaseContext';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';

const task: WeeklyTask = {
  frequency: 3,
  id: '1',
  parentId: 'weekly',
  position: 4,
  description: 'Strength training',
  category: '💪',
  completed: [getTimestampDaysAgo(4), getTimestampDaysAgo(2)],
};

const useValue: ContextType['useValue'] = () => ({
  value: {} as any,
  loading: false,
});

const expectToBeInViewMode = () => {
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: task.category }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  expect(screen.getByRole('group')).toBeInTheDocument();
};

describe('ThisWeekTask', () => {
  describe('in view mode', () => {
    describe('when the user clicks the button', () => {
      it('updates the list of times completed', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem } },
        );

        await user.click(screen.getByRole('button', { name: task.category }));

        expect(updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [...task.completed!, expect.any(Number)],
          }),
        );
      });
    });

    describe('when the user shift+clicks the button', () => {
      it('removes the most recently completed item', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem } },
        );

        await user.keyboard('{Shift>}');
        await user.click(screen.getByRole('button', { name: task.category }));

        expect(updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [task.completed?.[0]],
          }),
        );
      });
    });

    describe('when the user clicks the unfilled part of the bar', () => {
      it('adds a done for today', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem } },
        );

        await user.click(screen.getByRole('button', { name: 'Mark done' }));

        expect(updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [...task.completed!, expect.any(Number)],
          }),
        );
      });
    });

    describe('when the user ctrl+clicks the unfilled part of the bar', () => {
      it('adds a done for yesterday', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem } },
        );

        await user.keyboard('{Control>}');
        await user.click(screen.getByRole('button', { name: 'Mark done' }));

        const [, updated] = updateItem.mock.calls[0];
        expect(getDateFromTimestamp(updated.completed.at(-1)).toString()).toBe(
          getToday().subtract({ days: 1 }).toString(),
        );
      });
    });

    describe('when the user clicks the filled part of the bar', () => {
      it('removes the most recently completed item', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem } },
        );

        await user.click(screen.getByRole('button', { name: 'Undo' }));

        expect(updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [task.completed?.[0]],
          }),
        );
      });
    });

    describe('when the task has been completed enough times', () => {
      it('has nothing left to click to mark it done', () => {
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask
              task={{ ...task, completed: [...task.completed!, Date.now()] }}
            />
          </CategoriesContext.Provider>,
          { value: { useValue } },
        );

        expect(
          screen.queryByRole('button', { name: 'Mark done' }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Undo' }),
        ).toBeInTheDocument();
      });
    });

    describe('when the task has never been completed', () => {
      it('has nothing left to click to remove a done', () => {
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={{ ...task, completed: [] }} />
          </CategoriesContext.Provider>,
          { value: { useValue } },
        );

        expect(
          screen.queryByRole('button', { name: 'Undo' }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Mark done' }),
        ).toBeInTheDocument();
      });
    });

    describe('when the user clicks the description', () => {
      it('goes into edit mode', async () => {
        const user = userEvent.setup();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue } },
        );

        await user.click(screen.getByText(task.description));

        expect(
          screen.queryByRole('button', { name: task.category }),
        ).not.toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: task.category, hidden: true }),
        ).toHaveAttribute('aria-selected', 'true');

        expect(screen.queryByText(task.description)).not.toBeInTheDocument();
        const descriptionInput = screen.getByRole('textbox', {
          name: 'Description',
        });
        expect(descriptionInput).toHaveValue(task.description);

        expect(screen.queryByRole('group')).not.toBeInTheDocument();
        const frequencyInput = screen.getByRole('spinbutton', {
          name: 'Frequency',
        });
        expect(frequencyInput).toHaveValue(task.frequency);
      });
    });

    it('shows the current progress', () => {
      renderWithStorage(
        <CategoriesContext.Provider value={['🧘', '💪']}>
          <ThisWeekTask task={task} />
        </CategoriesContext.Provider>,
        { value: { useValue } },
      );

      expect(
        screen.getByRole('group', {
          name: `${task.description}: 2 of ${task.frequency} done`,
        }),
      ).toBeInTheDocument();
      const completedList = screen.getAllByRole('listitem');
      completedList.forEach((item) =>
        expect(item.textContent).toMatch(
          /^[A-Z][a-z][a-z] \d\d?(st|nd|rd|th)$/,
        ),
      );
    });

    describe('when the item has been completed more times than necessary', () => {
      it('also shows the overflow', () => {
        const tooMuchComplete = [
          getTimestampDaysAgo(7),
          getTimestampDaysAgo(6),
          getTimestampDaysAgo(5),
          ...task.completed!,
          getTimestampDaysAgo(1),
        ];
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={{ ...task, completed: tooMuchComplete }} />
          </CategoriesContext.Provider>,
          { value: { useValue } },
        );

        expect(screen.getByText('+3')).toBeInTheDocument();
      });
    });
  });

  describe('in edit mode', () => {
    describe('when the user picks a new category', () => {
      it('updates the category and switches to view mode', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem: onChange } },
        );

        await user.click(screen.getByText(task.description));

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: '🧘' }));

        expect(onChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ category: '🧘' }),
        );
        expectToBeInViewMode();
      });
    });

    describe('when the user updates the description/frequency and presses enter', () => {
      it('updates the description/frequency and switches to view mode', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem: onChange } },
        );

        await user.click(screen.getByText(task.description));

        const descriptionInput = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Strength & mobility');
        const frequencyInput = screen.getByRole('spinbutton', {
          name: 'Frequency',
        });
        await user.clear(frequencyInput);
        await user.type(frequencyInput, '4');
        await user.keyboard('{Enter}');

        expect(onChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            description: 'Strength & mobility',
            frequency: 4,
          }),
        );
        expectToBeInViewMode();
      });
    });

    describe('when the user deletes the description and presses enter', () => {
      it('deletes the item', async () => {
        const user = userEvent.setup();
        const onDelete = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, deleteItem: onDelete } },
        );

        await user.click(screen.getByText(task.description));

        const descriptionInput = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.clear(descriptionInput);
        await user.keyboard('{Enter}');

        expect(onDelete).toHaveBeenCalled();
      });
    });

    describe('when the user deletes the frequency', () => {
      it('switches back to view mode without changing anything', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const onDelete = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem: onChange, deleteItem: onDelete } },
        );

        await user.click(screen.getByText(task.description));

        await user.clear(
          screen.getByRole('spinbutton', {
            name: 'Frequency',
          }),
        );
        await user.keyboard('{Enter}');

        expect(onChange).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expectToBeInViewMode();
        expect(
          screen.getByRole('group', {
            name: `${task.description}: 2 of ${task.frequency} done`,
          }),
        ).toBeInTheDocument();
      });
    });

    describe('whe the user presses Escape', () => {
      it('returns to view mode without saving any changes', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem: onChange } },
        );

        await user.click(screen.getByText(task.description));

        const descriptionInput = screen.getByRole('textbox', {
          name: 'Description',
        });
        await user.clear(descriptionInput);
        await user.type(descriptionInput, 'Strength & mobility');
        const frequencyInput = screen.getByRole('spinbutton', {
          name: 'Frequency',
        });
        await user.clear(frequencyInput);
        await user.type(frequencyInput, '4');
        await user.keyboard('{Escape}');

        expect(onChange).not.toHaveBeenCalled();
        expectToBeInViewMode();
      });
    });
  });
});
