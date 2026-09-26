import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseClass } from '../../shared/types';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { ExerciseClasses } from './ExerciseClasses';

const pistolSquat: ExerciseClass = {
  id: 'pistol',
  description: 'Pistol squat',
  times: [
    { id: 'week1-', total: 3, completed: 3 },
    { id: 'week2-', total: 3, completed: 1 },
  ],
};

describe('ExerciseClasses', () => {
  describe('a class in progress', () => {
    it('ticks as many classes as are completed in each block', () => {
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
      it('adds one to the completed classes in its block', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithHealthStorage(
          <ExerciseClasses />,
          { classes: [pistolSquat] },
        );

        await user.click(screen.getByRole('checkbox', { name: 'week2-1' }));

        expect(storageContext.updateClass).toHaveBeenCalledWith({
          ...pistolSquat,
          times: [
            { id: 'week1-', total: 3, completed: 3 },
            { id: 'week2-', total: 3, completed: 2 },
          ],
        });
      });
    });

    describe('when a ticked class is unticked', () => {
      it('takes one off the completed classes in its block', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithHealthStorage(
          <ExerciseClasses />,
          { classes: [pistolSquat] },
        );

        await user.click(screen.getByRole('checkbox', { name: 'week1-2' }));

        expect(storageContext.updateClass).toHaveBeenCalledWith({
          ...pistolSquat,
          times: [
            { id: 'week1-', total: 3, completed: 2 },
            { id: 'week2-', total: 3, completed: 1 },
          ],
        });
      });
    });
  });

  describe('when some classes are finished', () => {
    it('lists the finished ones last', () => {
      const finished: ExerciseClass = {
        id: 'finished',
        description: 'Finished',
        times: [{ id: 'finished-', total: 1, completed: 1 }],
      };
      renderWithHealthStorage(<ExerciseClasses />, {
        classes: [finished, pistolSquat],
      });

      expect(
        screen.getAllByRole('checkbox').map((box) => box.ariaLabel),
      ).toEqual([
        'week1-0',
        'week1-1',
        'week1-2',
        'week2-0',
        'week2-1',
        'week2-2',
        'finished-0',
      ]);
    });
  });
});
