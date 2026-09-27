import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseClass } from '../../shared/types';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { ExerciseClasses } from './ExerciseClasses';

describe('ExerciseClasses', () => {
  describe('a class in progress', () => {
    it('ticks as many classes as are completed in each block', () => {
      const pistolSquat: ExerciseClass = {
        id: 'pistol',
        description: 'Pistol squat',
        blocks: [
          { id: 'week1-', total: 3, completed: [0, 1, 2] },
          { id: 'week2-', total: 3, completed: [0] },
        ],
      };
      renderWithHealthStorage(<ExerciseClasses />, {
        classes: [pistolSquat],
      });

      expect(screen.getByRole('checkbox', { name: 'week1-2' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'week2-0' })).toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: 'week2-1' }),
      ).not.toBeChecked();
    });

    describe('when an unticked class is ticked', () => {
      it('adds the next class to the completed ones in its block', async () => {
        const user = userEvent.setup();
        const pistolSquat: ExerciseClass = {
          id: 'pistol',
          description: 'Pistol squat',
          blocks: [{ id: 'week1-', total: 3, completed: [0] }],
        };
        const { storageContext } = renderWithHealthStorage(
          <ExerciseClasses />,
          { classes: [pistolSquat] },
        );

        await user.click(screen.getByRole('checkbox', { name: 'week1-2' }));

        expect(storageContext.updateClass).toHaveBeenCalledWith({
          ...pistolSquat,
          blocks: [{ id: 'week1-', total: 3, completed: [0, 1] }],
        });
      });
    });

    describe('when a ticked class is unticked', () => {
      it('removes the last completed class in its block', async () => {
        const user = userEvent.setup();
        const pistolSquat: ExerciseClass = {
          id: 'pistol',
          description: 'Pistol squat',
          blocks: [{ id: 'week1-', total: 3, completed: [0, 1] }],
        };
        const { storageContext } = renderWithHealthStorage(
          <ExerciseClasses />,
          { classes: [pistolSquat] },
        );

        await user.click(screen.getByRole('checkbox', { name: 'week1-0' }));

        expect(storageContext.updateClass).toHaveBeenCalledWith({
          ...pistolSquat,
          blocks: [{ id: 'week1-', total: 3, completed: [0] }],
        });
      });
    });
  });

  describe('when some classes are finished', () => {
    it('lists the finished ones last', () => {
      const finished: ExerciseClass = {
        id: 'finished',
        description: 'Finished',
        blocks: [{ id: 'finished-', total: 1, completed: [0] }],
      };
      const unfinished: ExerciseClass = {
        id: 'unfinished',
        description: 'Unfinished',
        blocks: [{ id: 'unfinished-', total: 2 }],
      };
      renderWithHealthStorage(<ExerciseClasses />, {
        classes: [finished, unfinished],
      });

      expect(
        screen.getAllByRole('checkbox').map((box) => box.ariaLabel),
      ).toEqual(['unfinished-0', 'unfinished-1', 'finished-0']);
    });
  });
});
