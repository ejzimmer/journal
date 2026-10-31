import { screen } from '@testing-library/react';
import { ThisWeekTask } from './ThisWeekTask';
import { WeeklyTask } from '../../../shared/types';
import userEvent from '@testing-library/user-event';
import { CategoriesContext } from '..';
import { getDateDaysAgo, getToday } from '../../../shared/dates';
import { ContextType } from '../../../shared/FirebaseContext';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';
import {
  mockSmallScreen,
  restoreScreenSize,
} from '../../../shared/mediaQueryTestUtils';

const task: WeeklyTask = {
  frequency: 3,
  id: '1',
  parentId: 'weekly',
  position: 4,
  description: 'Strength training',
  category: '💪',
  completed: [getDateDaysAgo(4), getDateDaysAgo(2)],
};

const useValue: ContextType['useValue'] = () => ({
  value: {} as any,
  loading: false,
  synced: true,
});

const getEditControls = () => [
  screen.getByRole('combobox'),
  screen.getByRole('textbox', { name: 'Description' }),
  screen.getByRole('spinbutton', { name: 'Frequency' }),
];

const expectToBeInViewMode = (editControls: HTMLElement[]) => {
  editControls.forEach((control) => expect(control).not.toBeInTheDocument());
  expect(
    screen.getByRole('button', { name: task.category }),
  ).toBeInTheDocument();
  expect(screen.getByRole('group')).toBeInTheDocument();
};

describe('ThisWeekTask', () => {
  describe('in view mode', () => {
    describe('the emoji menu', () => {
      const renderTask = (updateItem: jest.Mock) => {
        renderWithStorage(
          <CategoriesContext.Provider value={['🧘', '💪']}>
            <ThisWeekTask task={task} />
          </CategoriesContext.Provider>,
          { value: { useValue, updateItem } },
        );
      };

      const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('button', { name: task.category }));
      };

      describe('when the user picks add today', () => {
        it('adds a done for today', async () => {
          const user = userEvent.setup();
          const updateItem = jest.fn();
          renderTask(updateItem);

          await openMenu(user);
          await user.click(screen.getByRole('menuitem', { name: 'Add today' }));

          expect(updateItem).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              completed: [...task.completed!, getToday()],
            }),
          );
        });
      });

      describe('when the user picks add yesterday', () => {
        it('adds a done for yesterday', async () => {
          const user = userEvent.setup();
          const updateItem = jest.fn();
          renderTask(updateItem);

          await openMenu(user);
          await user.click(
            screen.getByRole('menuitem', { name: 'Add yesterday' }),
          );

          expect(updateItem).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              completed: [...task.completed!, getDateDaysAgo(1)],
            }),
          );
        });
      });

      describe('when the user enters a specific date', () => {
        it('adds a done for that date', async () => {
          const user = userEvent.setup();
          const updateItem = jest.fn();
          renderTask(updateItem);

          await openMenu(user);
          const dateInput = screen.getByLabelText('Date');
          await user.clear(dateInput);
          await user.type(dateInput, getDateDaysAgo(3));
          await user.keyboard('{Enter}');

          expect(updateItem).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              completed: [...task.completed!, getDateDaysAgo(3)],
            }),
          );
        });
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
            completed: [...task.completed!, getToday()],
          }),
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
              task={{ ...task, completed: [...task.completed!, getToday()] }}
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

        const categoryButton = screen.getByRole('button', {
          name: task.category,
        });
        const description = screen.getByText(task.description);
        const progress = screen.getByRole('group');

        await user.click(description);

        expect(categoryButton).not.toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: task.category, hidden: true }),
        ).toHaveAttribute('aria-selected', 'true');

        expect(description).not.toBeInTheDocument();
        const descriptionInput = screen.getByRole('textbox', {
          name: 'Description',
        });
        expect(descriptionInput).toHaveValue(task.description);

        expect(progress).not.toBeInTheDocument();
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
          getDateDaysAgo(7),
          getDateDaysAgo(6),
          getDateDaysAgo(5),
          ...task.completed!,
          getDateDaysAgo(1),
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

  describe('on a small screen', () => {
    beforeEach(mockSmallScreen);
    afterEach(restoreScreenSize);

    const renderTask = (weeklyTask: WeeklyTask, updateItem = jest.fn()) =>
      renderWithStorage(
        <CategoriesContext.Provider value={['🧘', '💪']}>
          <ThisWeekTask task={weeklyTask} />
        </CategoriesContext.Provider>,
        { value: { useValue, updateItem } },
      );

    it('shows how many are done out of how many are needed', () => {
      renderTask(task);

      const progress = screen.getByRole('group', {
        name: `${task.description}: 2 of ${task.frequency} done`,
      });
      expect(progress).toHaveTextContent('23');
    });

    describe('when the user clicks the done count', () => {
      it('adds a done for today', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderTask(task, updateItem);

        await user.click(screen.getByRole('button', { name: 'Mark done' }));

        expect(updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            completed: [...task.completed!, getToday()],
          }),
        );
      });
    });

    describe('when the user clicks the frequency', () => {
      it('removes the most recently completed item', async () => {
        const user = userEvent.setup();
        const updateItem = jest.fn();
        renderTask(task, updateItem);

        await user.click(screen.getByRole('button', { name: 'Undo' }));

        expect(updateItem).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ completed: [task.completed?.[0]] }),
        );
      });

      describe('and the task has never been completed', () => {
        it('leaves the task as it is', async () => {
          const user = userEvent.setup();
          const updateItem = jest.fn();
          renderTask({ ...task, completed: [] }, updateItem);

          await user.click(screen.getByRole('button', { name: 'Undo' }));

          expect(updateItem).not.toHaveBeenCalled();
        });
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
        const editControls = getEditControls();

        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: '🧘' }));

        expect(onChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ category: '🧘' }),
        );
        expectToBeInViewMode(editControls);
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
        const editControls = getEditControls();

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
        expectToBeInViewMode(editControls);
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
        const editControls = getEditControls();

        await user.clear(
          screen.getByRole('spinbutton', {
            name: 'Frequency',
          }),
        );
        await user.keyboard('{Enter}');

        expect(onChange).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
        expectToBeInViewMode(editControls);
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
        const editControls = getEditControls();

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
        expectToBeInViewMode(editControls);
      });
    });
  });
});
