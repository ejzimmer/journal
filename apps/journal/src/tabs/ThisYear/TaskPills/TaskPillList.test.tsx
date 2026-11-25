import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { DAILY_KEY, DailyTask } from '../../../types';
import { TaskPillList } from './TaskPillList';

const createTask = (description: string, position: number): DailyTask => ({
  id: description,
  description,
  category: '🪥',
  parentId: DAILY_KEY,
  position,
  type: '毎日',
  status: 'ready',
  lastCompleted: '',
});

const tasks = ['Brush teeth', 'Floss', 'Stretch', 'Read'].map(createTask);

function renderList({ withAction = false } = {}) {
  const storage = createMockFirebaseContext({
    today: { 日: Object.fromEntries(tasks.map((task) => [task.id, task])) },
  });
  render(
    <FirebaseContext.Provider value={storage}>
      <TaskPillList
        listId={DAILY_KEY}
        renderAction={
          withAction
            ? (task) => <button>{`Action for ${task.description}`}</button>
            : undefined
        }
      />
    </FirebaseContext.Provider>,
  );
}

const getTaskOrder = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => within(item).getByRole('group').getAttribute('aria-label'));

describe('TaskPillList', () => {
  it('lists the tasks in position order', () => {
    renderList();

    expect(getTaskOrder()).toEqual(['Brush teeth', 'Floss', 'Stretch', 'Read']);
  });

  describe('when given an action', () => {
    it('renders it in each task', () => {
      renderList({ withAction: true });

      const floss = screen.getAllByRole('listitem')[1];
      expect(
        within(floss).getByRole('button', { name: 'Action for Floss' }),
      ).toBeInTheDocument();
    });
  });

  describe('when the user ticks a task off', () => {
    it('ticks it and lights it up as done', async () => {
      const user = userEvent.setup();
      renderList();

      await user.click(screen.getByLabelText('Floss done'));

      expect(screen.getByLabelText('Floss done')).toBeChecked();
      expect(screen.getAllByRole('listitem')[1]).toHaveClass('status-done');
    });
  });

  describe('when a task has focus', () => {
    describe('and the user presses ArrowDown', () => {
      it('moves the task down one place and keeps it focused', async () => {
        const user = userEvent.setup();
        renderList();

        screen.getByRole('group', { name: 'Floss' }).focus();
        await user.keyboard('{ArrowDown}');

        expect(getTaskOrder()).toEqual([
          'Brush teeth',
          'Stretch',
          'Floss',
          'Read',
        ]);
        expect(screen.getByRole('group', { name: 'Floss' })).toHaveFocus();
      });
    });

    describe('and the user presses ArrowUp', () => {
      it('moves the task up one place and keeps it focused', async () => {
        const user = userEvent.setup();
        renderList();

        screen.getByRole('group', { name: 'Stretch' }).focus();
        await user.keyboard('{ArrowUp}');

        expect(getTaskOrder()).toEqual([
          'Brush teeth',
          'Stretch',
          'Floss',
          'Read',
        ]);
        expect(screen.getByRole('group', { name: 'Stretch' })).toHaveFocus();
      });
    });

    describe('and the user presses Shift+ArrowUp', () => {
      it('moves the task to the top', async () => {
        const user = userEvent.setup();
        renderList();

        screen.getByRole('group', { name: 'Stretch' }).focus();
        await user.keyboard('{Shift>}{ArrowUp}{/Shift}');

        expect(getTaskOrder()).toEqual([
          'Stretch',
          'Brush teeth',
          'Floss',
          'Read',
        ]);
        expect(screen.getByRole('group', { name: 'Stretch' })).toHaveFocus();
      });
    });

    describe('and the user presses Shift+ArrowDown', () => {
      it('moves the task to the bottom', async () => {
        const user = userEvent.setup();
        renderList();

        screen.getByRole('group', { name: 'Floss' }).focus();
        await user.keyboard('{Shift>}{ArrowDown}{/Shift}');

        expect(getTaskOrder()).toEqual([
          'Brush teeth',
          'Stretch',
          'Read',
          'Floss',
        ]);
        expect(screen.getByRole('group', { name: 'Floss' })).toHaveFocus();
      });
    });

    describe('and it is already at the top', () => {
      describe('and the user presses ArrowUp', () => {
        it('keeps the order and the focus', async () => {
          const user = userEvent.setup();
          renderList();

          screen.getByRole('group', { name: 'Brush teeth' }).focus();
          await user.keyboard('{ArrowUp}');

          expect(getTaskOrder()).toEqual([
            'Brush teeth',
            'Floss',
            'Stretch',
            'Read',
          ]);
          expect(
            screen.getByRole('group', { name: 'Brush teeth' }),
          ).toHaveFocus();
        });
      });
    });
  });

  describe("when a task's description button has focus", () => {
    describe('and the user presses ArrowDown', () => {
      it('keeps the order', async () => {
        const user = userEvent.setup();
        renderList();

        screen.getByRole('button', { name: 'Floss' }).focus();
        await user.keyboard('{ArrowDown}');

        expect(getTaskOrder()).toEqual([
          'Brush teeth',
          'Floss',
          'Stretch',
          'Read',
        ]);
      });
    });
  });
});
