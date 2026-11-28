import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { DAILY_KEY, DailyTask } from '../../../types';
import { CategoriesContext } from '../TodoCategoriesProvider';
import { TodayTask } from './TodayTask';

const task: DailyTask = {
  id: 'brush-teeth',
  description: 'Brush teeth',
  category: '🪥',
  parentId: DAILY_KEY,
  position: 0,
  type: '毎日',
  status: 'done',
  lastCompleted: '',
};

function renderTask({
  status = task.status,
  onChange = jest.fn(),
}: { status?: DailyTask['status']; onChange?: jest.Mock } = {}) {
  const storage = createMockFirebaseContext();
  const deleteItem = jest.spyOn(storage, 'deleteItem');
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <FirebaseContext.Provider value={storage}>
        <CategoriesContext.Provider value={['🪥', '🧹']}>
          {children}
        </CategoriesContext.Provider>
      </FirebaseContext.Provider>
    );
  }
  render(
    <TodayTask
      task={{ ...task, status }}
      listId={DAILY_KEY}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );
  return { onChange, deleteItem };
}

const getEditControls = () => [
  screen.getByRole('combobox', { name: 'Category' }),
  screen.getByRole('textbox', { name: 'Description' }),
];

const expectToBeInViewMode = (editControls: HTMLElement[] = []) => {
  expect(
    screen.getByRole('checkbox', { name: 'Brush teeth done' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Brush teeth')).toBeInTheDocument();
  editControls.forEach((control) => expect(control).not.toBeInTheDocument());
};

const expectToBeInEditMode = (checkbox: HTMLElement) => {
  expect(checkbox).not.toBeInTheDocument();
  expect(
    screen.getByRole('combobox', { name: 'Category' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('textbox', { name: 'Description' }),
  ).toBeInTheDocument();
};

describe('TodayTask', () => {
  describe('when the task is not done', () => {
    it('displays an unchecked emoji checkbox and the description', () => {
      renderTask({ status: 'ready' });

      expect(
        screen.getByText('🪥', { ignore: '[aria-hidden="true"]' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: 'Brush teeth done' }),
      ).not.toBeChecked();
      expectToBeInViewMode();
    });

    describe('and the user clicks the emoji checkbox', () => {
      it('marks the task done', async () => {
        const user = userEvent.setup();
        const { onChange } = renderTask({ status: 'ready' });

        await user.click(screen.getByRole('checkbox'));

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: task.id, status: 'done' }),
        );
      });
    });
  });

  describe('when the task is done', () => {
    it('displays a checked checkbox and the description', () => {
      renderTask();

      expect(
        screen.getByRole('checkbox', { name: 'Brush teeth done' }),
      ).toBeChecked();
      expectToBeInViewMode();
    });

    describe('and the user clicks the emoji checkbox', () => {
      it('marks the task ready again', async () => {
        const user = userEvent.setup();
        const { onChange } = renderTask();

        await user.click(screen.getByRole('checkbox'));

        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({ id: task.id, status: 'ready' }),
        );
      });
    });
  });

  describe('when the user clicks the description', () => {
    it('switches to edit mode with the description focused', async () => {
      const user = userEvent.setup();
      renderTask();
      const checkbox = screen.getByRole('checkbox', {
        name: 'Brush teeth done',
      });

      await user.click(screen.getByText('Brush teeth'));

      expectToBeInEditMode(checkbox);
      const textInput = screen.getByRole('textbox', { name: 'Description' });
      expect(textInput).toHaveValue('Brush teeth');
      expect(textInput).toHaveFocus();
    });
  });

  describe('when the user presses Enter on the description', () => {
    it('switches to edit mode with the description focused', async () => {
      const user = userEvent.setup();
      renderTask();
      const checkbox = screen.getByRole('checkbox', {
        name: 'Brush teeth done',
      });

      await user.tab();
      await user.tab();
      await user.keyboard('{Enter}');

      expectToBeInEditMode(checkbox);
      expect(
        screen.getByRole('textbox', { name: 'Description' }),
      ).toHaveFocus();
    });
  });

  describe('in edit mode', () => {
    describe('when the user presses Escape', () => {
      it('returns focus to the description', async () => {
        const user = userEvent.setup();
        renderTask();

        await user.click(screen.getByText('Brush teeth'));
        await user.keyboard('{Escape}');

        expect(screen.getByText('Brush teeth')).toHaveFocus();
      });
    });

    describe('when the user selects a new category', () => {
      it('saves the category and switches back to view mode', async () => {
        const user = userEvent.setup();
        const { onChange } = renderTask();
        await user.click(screen.getByText('Brush teeth'));
        const editControls = getEditControls();

        await user.click(
          screen.getByRole('option', { name: '🧹', hidden: true }),
        );

        expect(onChange).toHaveBeenCalledWith({ ...task, category: '🧹' });
        expectToBeInViewMode(editControls);
      });
    });

    describe('when the user updates the description', () => {
      describe('then presses Enter', () => {
        it('saves the description and switches back to view mode', async () => {
          const user = userEvent.setup();
          const { onChange } = renderTask();
          await user.click(screen.getByText('Brush teeth'));
          const editControls = getEditControls();

          const input = screen.getByRole('textbox', { name: 'Description' });
          await user.clear(input);
          await user.type(input, 'Floss teeth{Enter}');

          expect(onChange).toHaveBeenCalledWith({
            ...task,
            description: 'Floss teeth',
          });
          expectToBeInViewMode(editControls);
        });
      });

      describe('then presses Escape', () => {
        it('switches back to view mode without saving', async () => {
          const user = userEvent.setup();
          const { onChange } = renderTask();
          await user.click(screen.getByText('Brush teeth'));
          const editControls = getEditControls();

          const input = screen.getByRole('textbox', { name: 'Description' });
          await user.clear(input);
          await user.type(input, 'Floss teeth{Escape}');

          expect(onChange).not.toHaveBeenCalled();
          expectToBeInViewMode(editControls);
        });
      });
    });

    describe('when the user clears the description', () => {
      describe('then presses Enter', () => {
        it('deletes the task', async () => {
          const user = userEvent.setup();
          const { onChange, deleteItem } = renderTask();
          await user.click(screen.getByText('Brush teeth'));

          await user.clear(
            screen.getByRole('textbox', { name: 'Description' }),
          );
          await user.keyboard('{Enter}');

          expect(deleteItem).toHaveBeenCalledWith(DAILY_KEY, task);
          expect(onChange).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the user doesn't update the description", () => {
      describe('then presses Enter', () => {
        it('switches back to view mode without saving', async () => {
          const user = userEvent.setup();
          const { onChange } = renderTask();
          await user.click(screen.getByText('Brush teeth'));
          const editControls = getEditControls();

          await user.keyboard('{Enter}');

          expect(onChange).not.toHaveBeenCalled();
          expectToBeInViewMode(editControls);
        });
      });
    });
  });
});
