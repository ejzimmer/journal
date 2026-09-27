import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseClass } from '../../shared/types';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { ExerciseClasses } from './ExerciseClasses';

describe('ExerciseClasses', () => {
  describe('a class that is a set number of classes', () => {
    it('names each checkbox by its class number, ticks the completed ones, and lets any class be ticked', async () => {
      const user = userEvent.setup();
      const wheel: ExerciseClass = {
        id: 'wheel',
        description: 'Wheel',
        times: [{ id: 'all', total: 5, completed: [0, 3] }],
      };
      const { storageContext } = renderWithHealthStorage(<ExerciseClasses />, {
        classes: [wheel],
      });

      expect(
        screen.getByRole('checkbox', { name: 'Wheel: Class 4' }),
      ).toBeChecked();
      const classThree = screen.getByRole('checkbox', {
        name: 'Wheel: Class 3',
      });
      expect(classThree).not.toBeChecked();

      await user.click(classThree);

      expect(storageContext.updateClass).toHaveBeenCalledWith({
        ...wheel,
        times: [{ id: 'all', total: 5, completed: [0, 2, 3] }],
      });
    });

    describe('when a completed class is unticked', () => {
      it('removes just that class from the completed ones', async () => {
        const user = userEvent.setup();
        const wheel: ExerciseClass = {
          id: 'wheel',
          description: 'Wheel',
          times: [{ id: 'all', total: 5, completed: [0, 3] }],
        };
        const { storageContext } = renderWithHealthStorage(
          <ExerciseClasses />,
          { classes: [wheel] },
        );

        await user.click(
          screen.getByRole('checkbox', { name: 'Wheel: Class 1' }),
        );

        expect(storageContext.updateClass).toHaveBeenCalledWith({
          ...wheel,
          times: [{ id: 'all', total: 5, completed: [3] }],
        });
      });
    });
  });

  describe('a class split into weeks', () => {
    it('names each checkbox by its week and class and ticks the completed ones', () => {
      const pistolSquat: ExerciseClass = {
        id: 'pistol',
        description: 'Pistol squat',
        times: [
          { id: 'week-1', total: 3, completed: [1] },
          { id: 'week-2', total: 3 },
        ],
      };
      renderWithHealthStorage(<ExerciseClasses />, {
        classes: [pistolSquat],
      });

      expect(
        screen.getByRole('checkbox', {
          name: 'Pistol squat: Week 1, class 2',
        }),
      ).toBeChecked();
      expect(
        screen.getByRole('checkbox', {
          name: 'Pistol squat: Week 2, class 2',
        }),
      ).not.toBeChecked();
    });

    describe('when a class is ticked', () => {
      it('adds it to the completed classes of its week', async () => {
        const user = userEvent.setup();
        const pistolSquat: ExerciseClass = {
          id: 'pistol',
          description: 'Pistol squat',
          times: [
            { id: 'week-1', total: 3, completed: [0, 1, 2] },
            { id: 'week-2', total: 3 },
          ],
        };
        const { storageContext } = renderWithHealthStorage(
          <ExerciseClasses />,
          { classes: [pistolSquat] },
        );

        await user.click(
          screen.getByRole('checkbox', {
            name: 'Pistol squat: Week 2, class 3',
          }),
        );

        expect(storageContext.updateClass).toHaveBeenCalledWith({
          ...pistolSquat,
          times: [
            { id: 'week-1', total: 3, completed: [0, 1, 2] },
            { id: 'week-2', total: 3, completed: [2] },
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
        times: [{ id: 'all', total: 1, completed: [0] }],
      };
      const unfinished: ExerciseClass = {
        id: 'unfinished',
        description: 'Unfinished',
        times: [{ id: 'all', total: 2, completed: [0] }],
      };
      renderWithHealthStorage(<ExerciseClasses />, {
        classes: [finished, unfinished],
      });

      expect(
        screen.getAllByRole('checkbox').map((box) => box.ariaLabel),
      ).toEqual([
        'Unfinished: Class 1',
        'Unfinished: Class 2',
        'Finished: Class 1',
      ]);
    });
  });
});
