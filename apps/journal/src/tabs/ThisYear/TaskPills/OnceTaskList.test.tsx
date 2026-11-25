import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToday } from 'shared/dates';
import { ContextType, FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { DAILY_GOALS_KEY, TaskGoal } from 'shared/dailyGoals/types';
import { DailyTask, ONCE_KEY, DailyGoalItem } from '../../../types';
import { OnceTaskList } from './OnceTaskList';

const parcel: DailyTask = {
  id: 'parcel',
  description: 'parcel',
  category: '📦',
  parentId: ONCE_KEY,
  position: 0,
  type: '一度',
  status: 'ready',
  lastCompleted: getToday(),
};

const createGoal = (id: string, position: number): TaskGoal => ({
  id,
  position,
  taskPath: `${ONCE_KEY}/${id}`,
});

function renderOnceTaskList(slots: Record<string, DailyGoalItem> = {}) {
  const storage = createMockFirebaseContext({
    today: { 一: { parcel } },
    今日: { slots },
  });
  render(
    <FirebaseContext.Provider value={storage}>
      <OnceTaskList />
    </FirebaseContext.Provider>,
  );

  return {
    storage,
    toggle: screen.getByRole('switch', { name: 'Do parcel today' }),
  };
}

function readValue<T>(storage: ContextType, key: string) {
  let value: T | undefined;
  function Reader() {
    value = storage.useValue<T>(key).value;
    return null;
  }
  render(
    <FirebaseContext.Provider value={storage}>
      <Reader />
    </FirebaseContext.Provider>,
  );
  return value;
}

describe('OnceTaskList', () => {
  describe("when a task isn't in a Today slot", () => {
    it('shows its switch off', () => {
      const { toggle } = renderOnceTaskList();

      expect(toggle).not.toBeChecked();
    });

    describe('and the user switches it on', () => {
      it('puts the task in the next slot and keeps it in the one-off list', async () => {
        const { storage, toggle } = renderOnceTaskList({
          library: createGoal('library', 0),
        });

        await userEvent.click(toggle);

        expect(
          Object.values(readValue<object>(storage, DAILY_GOALS_KEY) ?? {}),
        ).toContainEqual(
          expect.objectContaining({
            taskPath: `${ONCE_KEY}/parcel`,
            position: 1,
          }),
        );
        expect(readValue(storage, `${ONCE_KEY}/parcel`)).toEqual(parcel);
        expect(toggle).toBeChecked();
      });
    });

    describe('and every slot is full', () => {
      it('disables its switch', () => {
        const { toggle } = renderOnceTaskList({
          a: createGoal('a', 0),
          b: createGoal('b', 1),
          c: createGoal('c', 2),
        });

        expect(toggle).toBeDisabled();
      });
    });
  });

  describe('when a task is in a Today slot', () => {
    const slots = {
      a: createGoal('a', 0),
      b: createGoal('b', 1),
      parcel: createGoal('parcel', 2),
    };

    it('shows its switch on', () => {
      const { toggle } = renderOnceTaskList(slots);

      expect(toggle).toBeChecked();
    });

    describe('and the other slots are full', () => {
      it('keeps its switch enabled', () => {
        const { toggle } = renderOnceTaskList(slots);

        expect(toggle).toBeEnabled();
      });
    });

    describe('and the user switches it off', () => {
      it('frees its slot and keeps it in the one-off list', async () => {
        const { storage, toggle } = renderOnceTaskList(slots);

        await userEvent.click(toggle);

        expect(
          Object.keys(readValue<object>(storage, DAILY_GOALS_KEY) ?? {}),
        ).toEqual(['a', 'b']);
        expect(readValue(storage, `${ONCE_KEY}/parcel`)).toEqual(parcel);
        expect(toggle).not.toBeChecked();
      });
    });
  });
});
