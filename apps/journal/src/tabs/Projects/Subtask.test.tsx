import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import { ProjectSubtask } from '../../types';
import { SubtaskGoal, DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { Subtask } from './Subtask';

const projectPath = 'projects/shelves';
const path = `${projectPath}/subtasks`;
const drill: ProjectSubtask = {
  id: 'drill',
  description: 'Borrow a drill',
  category: '🚚',
  position: 0,
  status: 'ready',
};

const createGoal = (id: string, position: number): SubtaskGoal => ({
  id,
  position,
  projectPath: 'projects/other',
  subtaskPath: `projects/other/subtasks/${id}`,
});

function renderSubtask(slots: Record<string, SubtaskGoal> = {}) {
  const storage = createMockFirebaseContext({ 今日: { slots } });
  const addItem = jest.spyOn(storage, 'addItem');
  const setValues = jest.spyOn(storage, 'setValues');
  render(
    <FirebaseContext.Provider value={storage}>
      <ol>
        <Subtask
          path={path}
          projectPath={projectPath}
          dragHandle={<span />}
          {...drill}
        />
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
          const { addItem } = renderSubtask({ a: createGoal('a', 0) });

          await userEvent.click(
            screen.getByRole('checkbox', { name: 'On today' }),
          );

          expect(addItem).toHaveBeenCalledWith(DAILY_GOALS_KEY, {
            projectPath,
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
          a: createGoal('a', 0),
          b: createGoal('b', 1),
          c: createGoal('c', 2),
        });

        expect(
          screen.getByRole('checkbox', { name: 'On today' }),
        ).toBeDisabled();
      });
    });
  });

  describe('when the subtask is already a daily goal', () => {
    describe('and the user unticks the link checkbox', () => {
      it('removes the goal', async () => {
        const { setValues } = renderSubtask({
          goal: {
            id: 'goal',
            position: 0,
            projectPath,
            subtaskPath: `${path}/drill`,
          },
        });
        const checkbox = screen.getByRole('checkbox', { name: 'On today' });
        expect(checkbox).toBeChecked();

        await userEvent.click(checkbox);

        expect(setValues).toHaveBeenCalledWith({
          [`${DAILY_GOALS_KEY}/goal`]: null,
        });
        expect(checkbox).not.toBeChecked();
      });
    });
  });
});
