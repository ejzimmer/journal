import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { DAILY_KEY, DailyTask } from '../../../types';
import { EveryDayTaskList } from './EveryDayTaskList';

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

const tasks = ['Floss', 'Brush teeth', 'Stretch'].map(createTask);

function renderList() {
  const storage = createMockFirebaseContext({
    today: { 日: Object.fromEntries(tasks.map((task) => [task.id, task])) },
  });
  render(
    <FirebaseContext.Provider value={storage}>
      <EveryDayTaskList />
    </FirebaseContext.Provider>,
  );
}

const getTaskOrder = () =>
  screen
    .getAllByRole('listitem')
    .map((item) => within(item).getByRole('group').getAttribute('aria-label'));

describe('EveryDayTaskList', () => {
  describe('when there are every day tasks', () => {
    it('lists them in position order', () => {
      renderList();

      expect(getTaskOrder()).toEqual(['Floss', 'Brush teeth', 'Stretch']);
    });

    describe('and the user ticks one off', () => {
      it('ticks it and lights it up as done', async () => {
        const user = userEvent.setup();
        renderList();

        await user.click(screen.getByLabelText('Brush teeth done'));

        expect(screen.getByLabelText('Brush teeth done')).toBeChecked();
        expect(screen.getAllByRole('listitem')[1]).toHaveClass('status-done');
      });
    });

    describe('and the user focuses one and presses ArrowDown', () => {
      it('moves that task down one place', async () => {
        const user = userEvent.setup();
        renderList();

        screen.getByRole('group', { name: 'Floss' }).focus();
        await user.keyboard('{ArrowDown}');

        expect(getTaskOrder()).toEqual(['Brush teeth', 'Floss', 'Stretch']);
      });
    });
  });
});
