import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { ProjectSubtask, SubtaskSlot, TODAY_SLOTS_KEY } from '../../types';
import { Subtask } from './Subtask';

const path = 'projects/shelves/subtasks';
const drill: ProjectSubtask = {
  id: 'drill',
  description: 'Borrow a drill',
  category: '🚚',
  position: 0,
  status: 'ready',
};

const createSlot = (id: string, position: number): SubtaskSlot => ({
  id,
  position,
  subtaskPath: `projects/other/subtasks/${id}`,
});

function renderSubtask(slots: Record<string, SubtaskSlot> = {}) {
  const storage = createMockFirebaseContext({ 今日: { slots } });
  const addItem = jest.spyOn(storage, 'addItem');
  const setValues = jest.spyOn(storage, 'setValues');
  render(
    <FirebaseContext.Provider value={storage}>
      <ol>
        <Subtask path={path} dragHandle={<span />} {...drill} />
      </ol>
    </FirebaseContext.Provider>,
  );

  return { addItem, setValues };
}

describe('Subtask', () => {
  describe('when the subtask is not on today', () => {
    describe('and a Today slot is free', () => {
      describe('and the user ticks the link checkbox', () => {
        it('puts the subtask in the next Today slot', async () => {
          const { addItem } = renderSubtask({ a: createSlot('a', 0) });

          await userEvent.click(
            screen.getByRole('checkbox', { name: 'On today' }),
          );

          expect(addItem).toHaveBeenCalledWith(TODAY_SLOTS_KEY, {
            subtaskPath: `${path}/drill`,
            position: 1,
          });
          expect(
            screen.getByRole('checkbox', { name: 'On today' }),
          ).toBeChecked();
        });
      });
    });

    describe('and every Today slot is full', () => {
      it('disables the link checkbox', () => {
        renderSubtask({
          a: createSlot('a', 0),
          b: createSlot('b', 1),
          c: createSlot('c', 2),
        });

        expect(
          screen.getByRole('checkbox', { name: 'On today' }),
        ).toBeDisabled();
      });
    });
  });

  describe('when the subtask is already in a Today slot', () => {
    describe('and the user unticks the link checkbox', () => {
      it('empties that slot', async () => {
        const { setValues } = renderSubtask({
          slot: { id: 'slot', position: 0, subtaskPath: `${path}/drill` },
        });
        const checkbox = screen.getByRole('checkbox', { name: 'On today' });
        expect(checkbox).toBeChecked();

        await userEvent.click(checkbox);

        expect(setValues).toHaveBeenCalledWith({
          [`${TODAY_SLOTS_KEY}/slot`]: null,
        });
        expect(checkbox).not.toBeChecked();
      });
    });
  });
});
