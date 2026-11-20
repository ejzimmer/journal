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
  render(
    <FirebaseContext.Provider value={storage}>
      <ol>
        <Subtask path={path} dragHandle={<span />} {...drill} />
      </ol>
    </FirebaseContext.Provider>,
  );

  return { addItem };
}

describe('Subtask', () => {
  describe('when a Today slot is free', () => {
    describe('and the user clicks the link button', () => {
      it('puts the subtask in the next Today slot', async () => {
        const { addItem } = renderSubtask({ a: createSlot('a', 0) });

        await userEvent.click(
          screen.getByRole('button', { name: 'Add to today' }),
        );

        expect(addItem).toHaveBeenCalledWith(TODAY_SLOTS_KEY, {
          subtaskPath: `${path}/drill`,
          position: 1,
        });
      });

      it('swaps the button for the linked marker', async () => {
        renderSubtask();
        const button = screen.getByRole('button', { name: 'Add to today' });

        await userEvent.click(button);

        expect(button).not.toBeInTheDocument();
        expect(screen.getByText('🔗')).toBeInTheDocument();
      });
    });
  });

  describe('when every Today slot is full', () => {
    it('disables the link button', () => {
      renderSubtask({
        a: createSlot('a', 0),
        b: createSlot('b', 1),
        c: createSlot('c', 2),
      });

      expect(
        screen.getByRole('button', { name: 'Add to today' }),
      ).toBeDisabled();
    });
  });
});
