import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToday } from 'shared/dates';
import { ContextType, FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import {
  DailyTask,
  ONCE_KEY,
  TODAY_SLOTS_KEY,
  TodaySlot,
} from '../../../types';
import { MoveToTodayButton } from './MoveToTodayButton';

const createTask = (id: string, position = 0): DailyTask => ({
  id,
  description: id,
  category: '📦',
  parentId: ONCE_KEY,
  position,
  type: '一度',
  status: 'ready',
  lastCompleted: getToday(),
});

function renderButton(slots: Record<string, TodaySlot> = {}) {
  const parcel = createTask('parcel');
  const storage = createMockFirebaseContext({
    today: { 一: { parcel } },
    今日: { slots },
  });
  render(
    <FirebaseContext.Provider value={storage}>
      <MoveToTodayButton task={parcel} />
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

describe('MoveToTodayButton', () => {
  describe('when a Today slot is free', () => {
    describe('and the user clicks the arrow', () => {
      it('moves the task out of the one-off list into the next slot', async () => {
        const { storage } = renderButton({ library: createTask('library', 0) });

        await userEvent.click(
          screen.getByRole('button', { name: 'Move parcel to today' }),
        );

        expect(readValue(storage, ONCE_KEY)).toBeUndefined();
        expect(readValue(storage, `${TODAY_SLOTS_KEY}/parcel`)).toEqual(
          expect.objectContaining({ description: 'parcel', position: 1 }),
        );
      });
    });
  });

  describe('when every Today slot is full', () => {
    it('is disabled', () => {
      renderButton({
        a: createTask('a', 0),
        b: createTask('b', 1),
        c: createTask('c', 2),
      });

      expect(
        screen.getByRole('button', { name: 'Move parcel to today' }),
      ).toBeDisabled();
    });
  });
});
