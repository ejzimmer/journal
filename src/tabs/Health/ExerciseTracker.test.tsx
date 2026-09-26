import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseTracker } from './ExerciseTracker';
import { Exercise } from '../../shared/types';
import { renderWithHealthStorage } from './healthStorageTestUtils';

const exercises: Exercise[] = [
  {
    id: 'split',
    name: 'Bulgarian split squat',
    updates: {
      a: { id: 'a', date: '2026-08-12', details: '3 x 10 x 8kg' },
    },
  },
  {
    id: 'rdl',
    name: 'B-stance RDL',
    updates: {
      a: { id: 'a', date: '2026-08-12', details: '3 x 10 x 16kg' },
      b: { id: 'b', date: '2026-08-16', details: '3 x 10 x 20kg' },
      c: { id: 'c', date: '2026-08-20', details: '3 x 10 x 22kg' },
    },
  },
  { id: 'plank', name: 'Plank' },
];

describe('ExerciseTracker', () => {
  it('shows a row for each exercise', () => {
    renderWithHealthStorage(<ExerciseTracker />, { exercises });

    expect(
      screen.getAllByRole('rowheader').map((header) => header.textContent),
    ).toEqual(['Bulgarian split squat', 'B-stance RDL', 'Plank']);
  });

  it('gives every row one more update column than the exercise with the most updates', () => {
    renderWithHealthStorage(<ExerciseTracker />, { exercises });

    for (const { name } of exercises) {
      const row = screen.getByRole('row', { name: new RegExp(name) });
      expect(within(row).getAllByRole('cell')).toHaveLength(4);
    }
  });

  describe('when an exercise is added', () => {
    it('adds it to the health storage', async () => {
      const user = userEvent.setup();
      const addExercise = jest.fn();
      renderWithHealthStorage(<ExerciseTracker />, { exercises, addExercise });

      await user.click(screen.getByRole('button', { name: 'Add exercise' }));
      await user.keyboard('Goblet squat{Enter}');

      expect(addExercise).toHaveBeenCalledWith('Goblet squat');
    });
  });
});
