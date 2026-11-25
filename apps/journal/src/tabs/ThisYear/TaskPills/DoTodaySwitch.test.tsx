import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToday } from 'shared/dates';
import { ContextType, FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { DAILY_GOALS_KEY, TaskGoal } from 'shared/dailyGoals/types';
import { DailyTask, ONCE_KEY, DailyGoalItem } from '../../../types';
import { DoTodaySwitch } from './DoTodaySwitch';

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

function renderSwitch(slots: Record<string, DailyGoalItem> = {}) {
  const storage = createMockFirebaseContext({
    today: { 一: { parcel } },
    今日: { slots },
  });
  render(
    <FirebaseContext.Provider value={storage}>
      <DoTodaySwitch task={parcel} />
    </FirebaseContext.Provider>,
  );

  return { storage };
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

const readGoals = (storage: ContextType) =>
  Object.values(
    readValue<Record<string, DailyGoalItem>>(storage, DAILY_GOALS_KEY) ?? {},
  );

const getSwitch = () => screen.getByRole('switch', { name: 'Do parcel today' });

describe('DoTodaySwitch', () => {
  describe('when the task is not in a Today slot', () => {
    it('is off', () => {
      renderSwitch();

      expect(getSwitch()).not.toBeChecked();
    });

    describe('and the user switches it on', () => {
      it('puts the task in the next slot and keeps it in the one-off list', async () => {
        const { storage } = renderSwitch({ library: createGoal('library', 0) });

        await userEvent.click(getSwitch());

        expect(readGoals(storage)).toContainEqual(
          expect.objectContaining({
            taskPath: `${ONCE_KEY}/parcel`,
            position: 1,
          }),
        );
        expect(readValue(storage, `${ONCE_KEY}/parcel`)).toEqual(parcel);
        expect(getSwitch()).toBeChecked();
      });
    });

    describe('and every slot is full', () => {
      it('is disabled', () => {
        renderSwitch({
          a: createGoal('a', 0),
          b: createGoal('b', 1),
          c: createGoal('c', 2),
        });

        expect(getSwitch()).toBeDisabled();
      });
    });
  });

  describe('when the task is in a Today slot', () => {
    const slots = {
      a: createGoal('a', 0),
      b: createGoal('b', 1),
      parcel: createGoal('parcel', 2),
    };

    it('is on, even with every slot full', () => {
      renderSwitch(slots);

      expect(getSwitch()).toBeChecked();
      expect(getSwitch()).toBeEnabled();
    });

    describe('and the user switches it off', () => {
      it('frees its slot and keeps it in the one-off list', async () => {
        const { storage } = renderSwitch(slots);

        await userEvent.click(getSwitch());

        expect(readGoals(storage).map((goal) => goal.id)).toEqual(['a', 'b']);
        expect(readValue(storage, `${ONCE_KEY}/parcel`)).toEqual(parcel);
        expect(getSwitch()).not.toBeChecked();
      });
    });
  });
});
