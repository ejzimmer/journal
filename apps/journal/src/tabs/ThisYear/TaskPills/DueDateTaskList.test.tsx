import { render, screen } from '@testing-library/react';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { CalendarTask, CALENDAR_KEY } from '../../../types';
import { DueDateTaskList } from './DueDateTaskList';

const createTask = (description: string, dueDate: string): CalendarTask => ({
  id: description,
  description,
  dueDate,
  category: '🛒',
  parentId: CALENDAR_KEY,
  position: 0,
  status: 'ready',
  statusUpdateDate: '2026-08-01',
});

describe('DueDateTaskList', () => {
  it('lists the tasks soonest due first', () => {
    const tasks = [
      createTask('Renew passport', '2026-09-20'),
      createTask('Pay rent', '2026-08-10'),
      createTask('Book the dentist', '2026-08-14'),
    ];
    const storage = createMockFirebaseContext({
      today: { 暦: Object.fromEntries(tasks.map((task) => [task.id, task])) },
    });
    render(
      <FirebaseContext.Provider value={storage}>
        <DueDateTaskList />
      </FirebaseContext.Provider>,
    );

    expect(
      screen
        .getAllByRole('button', { name: /^(Renew|Pay|Book)/ })
        .map((button) => button.textContent),
    ).toEqual(['Pay rent', 'Book the dentist', 'Renew passport']);
  });
});
