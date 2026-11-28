import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToday } from 'shared/dates';
import { renderWithStorage } from 'shared/storageContextTestUtils';
import { CategoriesContext } from '../../Todo/TodoCategoriesProvider';
import { AddTodoForm } from './AddTodoForm';
import { CALENDAR_KEY, DAILY_KEY, ONCE_KEY, WEEKLY_KEY } from '../../../types';

function renderForm(
  lists: Record<string, unknown> = {},
  userOptions: Parameters<typeof userEvent.setup>[0] = {},
) {
  const addItem = jest.fn();
  renderWithStorage(
    <CategoriesContext.Provider value={['🛒']}>
      <AddTodoForm />
    </CategoriesContext.Provider>,
    {
      value: {
        addItem,
        useValue: <T,>(key?: string) => ({
          value: key ? (lists[key] as T) : undefined,
          loading: false,
          synced: true,
        }),
      },
    },
  );

  return { addItem, user: userEvent.setup(userOptions) };
}

describe('AddTodoForm', () => {
  describe('when the user types a description and presses Enter', () => {
    it('adds a ready one-off task to the end of the one-off list', async () => {
      const { addItem, user } = renderForm({
        [ONCE_KEY]: { bank: { id: 'bank', position: 4 } },
      });

      await user.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'Post the parcel{Enter}',
      );

      expect(addItem).toHaveBeenCalledWith(ONCE_KEY, {
        description: 'Post the parcel',
        category: expect.any(String),
        position: 5,
        type: '一度',
        status: 'ready',
        lastCompleted: getToday(),
      });
    });

    it('clears the description, ready for the next task', async () => {
      const { user } = renderForm();
      const description = screen.getByRole('textbox', { name: 'Description' });

      await user.type(description, 'Post the parcel{Enter}');

      expect(description).toHaveValue('');
    });
  });

  describe('when a task has just been created', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('lights the form green for a second', async () => {
      const { user } = renderForm(
        {},
        { advanceTimers: jest.advanceTimersByTime },
      );
      const form = screen.getByRole('form', { name: 'Add task' });

      await user.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'Post the parcel{Enter}',
      );
      expect(form).toHaveClass('just-created');

      act(() => jest.advanceTimersByTime(1000));
      expect(form).not.toHaveClass('just-created');
    });
  });

  describe('when the user submits without a description', () => {
    it('adds nothing', async () => {
      const { addItem, user } = renderForm();

      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(addItem).not.toHaveBeenCalled();
    });
  });

  describe('when the user switches to 毎日 and adds a task', () => {
    it('adds it to the daily list', async () => {
      const { addItem, user } = renderForm();

      await user.click(screen.getByRole('radio', { name: '毎日' }));
      await user.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'Take vitamins{Enter}',
      );

      expect(addItem).toHaveBeenCalledWith(
        DAILY_KEY,
        expect.objectContaining({ type: '毎日', status: 'ready' }),
      );
    });
  });

  describe('when the user switches to 毎週', () => {
    describe('and adds a task with a frequency', () => {
      it('adds it to the weekly list with nothing done yet', async () => {
        const { addItem, user } = renderForm();

        await user.click(screen.getByRole('radio', { name: '毎週' }));
        const frequency = screen.getByRole('spinbutton', { name: 'Frequency' });
        await user.clear(frequency);
        await user.type(frequency, '3');
        await user.type(
          screen.getByRole('textbox', { name: 'Description' }),
          'Go for a run{Enter}',
        );

        expect(addItem).toHaveBeenCalledWith(
          WEEKLY_KEY,
          expect.objectContaining({ frequency: 3, completed: [] }),
        );
      });
    });

    describe('and clears the frequency before submitting', () => {
      it('adds nothing', async () => {
        const { addItem, user } = renderForm();

        await user.click(screen.getByRole('radio', { name: '毎週' }));
        await user.clear(screen.getByRole('spinbutton', { name: 'Frequency' }));
        await user.type(
          screen.getByRole('textbox', { name: 'Description' }),
          'Go for a run{Enter}',
        );

        expect(addItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the user switches to 期日', () => {
    const fillInDueDateTask = async (
      user: ReturnType<typeof userEvent.setup>,
    ) => {
      await user.click(screen.getByRole('radio', { name: '期日' }));
      const dueDate = screen.getByLabelText('Due date');
      await user.clear(dueDate);
      await user.type(dueDate, '2026-12-14');
      await user.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'Renew passport',
      );
    };

    describe('and presses Repeats before adding a task', () => {
      it('adds a repeating task to the due date list', async () => {
        const { addItem, user } = renderForm();

        await fillInDueDateTask(user);
        await user.click(screen.getByRole('button', { name: 'Repeats' }));
        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(addItem).toHaveBeenCalledWith(
          CALENDAR_KEY,
          expect.objectContaining({
            description: 'Renew passport',
            dueDate: '2026-12-14',
            repeats: true,
          }),
        );
      });
    });

    describe('and leaves Repeats unpressed', () => {
      it('adds a task that only happens once', async () => {
        const { addItem, user } = renderForm();

        await fillInDueDateTask(user);
        await user.click(screen.getByRole('button', { name: 'Create' }));

        expect(addItem).toHaveBeenCalledWith(
          CALENDAR_KEY,
          expect.objectContaining({ repeats: false }),
        );
      });
    });
  });

  describe('when the user types a description and then switches type', () => {
    it('keeps the description', async () => {
      const { user } = renderForm();

      await user.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'Renew passport',
      );
      await user.click(screen.getByRole('radio', { name: '期日' }));

      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
        'Renew passport',
      );
    });
  });
});
