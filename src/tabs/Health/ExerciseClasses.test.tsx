import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { ExerciseClass } from '../../shared/types';
import {
  createHealthStorageContext,
  renderWithHealthStorage,
} from './healthStorageTestUtils';
import { HealthStorageContext } from './HealthStorageContext';
import { ExerciseClasses } from './ExerciseClasses';

function StoredClasses({ initial }: { initial: ExerciseClass[] }) {
  const [classes, setClasses] = useState(initial);
  return (
    <HealthStorageContext.Provider
      value={createHealthStorageContext({
        classes,
        updateClass: (updated) =>
          setClasses((current) =>
            current.map((exerciseClass) =>
              exerciseClass.id === updated.id ? updated : exerciseClass,
            ),
          ),
      })}
    >
      <ExerciseClasses />
    </HealthStorageContext.Provider>
  );
}

describe('ExerciseClasses', () => {
  describe('a class that is a set number of classes', () => {
    it('names each checkbox by its class number, ticks the completed ones, and lets any class be ticked', async () => {
      const user = userEvent.setup();
      const wheel: ExerciseClass = {
        id: 'wheel',
        description: 'Wheel',
        blocks: [{ id: 'all', total: 5, completed: [0, 3] }],
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
        blocks: [{ id: 'all', total: 5, completed: [0, 2, 3] }],
      });
    });

    describe('when a completed class is unticked', () => {
      it('removes just that class from the completed ones', async () => {
        const user = userEvent.setup();
        const wheel: ExerciseClass = {
          id: 'wheel',
          description: 'Wheel',
          blocks: [{ id: 'all', total: 5, completed: [0, 3] }],
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
          blocks: [{ id: 'all', total: 5, completed: [3] }],
        });
      });
    });
  });

  describe('a class split into weeks', () => {
    it('names each checkbox by its week and class and ticks the completed ones', () => {
      const pistolSquat: ExerciseClass = {
        id: 'pistol',
        description: 'Pistol squat',
        blocks: [
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
          blocks: [
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
          blocks: [
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
        blocks: [{ id: 'all', total: 1, completed: [0] }],
      };
      const unfinished: ExerciseClass = {
        id: 'unfinished',
        description: 'Unfinished',
        blocks: [{ id: 'all', total: 2, completed: [0] }],
      };
      renderWithHealthStorage(<ExerciseClasses />, {
        classes: [finished, unfinished],
      });

      const cards = screen.getAllByRole('listitem', { name: /finished/i });
      expect(cards).toHaveLength(2);
      expect(cards[0]).toHaveAccessibleName('Unfinished');
      expect(cards[1]).toHaveAccessibleName('Finished');
    });
  });

  describe('a finished class', () => {
    const handstand: ExerciseClass = {
      id: 'handstand',
      description: 'Handstand',
      blocks: [{ id: 'all', total: 2, completed: [0, 1] }],
    };

    it('shows a tick in place of its classes', () => {
      render(<StoredClasses initial={[handstand]} />);

      expect(
        screen.getByRole('button', {
          name: 'Handstand: all classes done. Show classes',
        }),
      ).toBeInTheDocument();
    });

    describe('when the tick is pressed', () => {
      it('shows the classes and focuses the first one', async () => {
        const user = userEvent.setup();
        render(<StoredClasses initial={[handstand]} />);
        const tick = screen.getByRole('button', {
          name: 'Handstand: all classes done. Show classes',
        });

        await user.click(tick);

        expect(tick).not.toBeInTheDocument();
        expect(
          screen.getByRole('checkbox', { name: 'Handstand: Class 1' }),
        ).toHaveFocus();
      });

      describe('and a class is unticked', () => {
        it('keeps showing the classes', async () => {
          const user = userEvent.setup();
          render(<StoredClasses initial={[handstand]} />);
          await user.click(
            screen.getByRole('button', {
              name: 'Handstand: all classes done. Show classes',
            }),
          );

          const classTwo = screen.getByRole('checkbox', {
            name: 'Handstand: Class 2',
          });
          await user.click(classTwo);

          expect(classTwo).not.toBeChecked();
        });

        describe('and then ticked again', () => {
          it('shows the tick again and focuses it', async () => {
            const user = userEvent.setup();
            render(<StoredClasses initial={[handstand]} />);
            await user.click(
              screen.getByRole('button', {
                name: 'Handstand: all classes done. Show classes',
              }),
            );
            const classTwo = screen.getByRole('checkbox', {
              name: 'Handstand: Class 2',
            });

            await user.click(classTwo);
            await user.click(classTwo);

            expect(classTwo).not.toBeInTheDocument();
            expect(
              screen.getByRole('button', {
                name: 'Handstand: all classes done. Show classes',
              }),
            ).toHaveFocus();
          });
        });
      });
    });
  });

  describe('when the last class of a class is ticked', () => {
    it('shows the tick in place of its classes and focuses it', async () => {
      const user = userEvent.setup();
      const wheel: ExerciseClass = {
        id: 'wheel',
        description: 'Wheel',
        blocks: [{ id: 'all', total: 2, completed: [0] }],
      };
      render(<StoredClasses initial={[wheel]} />);
      const classTwo = screen.getByRole('checkbox', { name: 'Wheel: Class 2' });

      await user.click(classTwo);

      expect(classTwo).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'Wheel: all classes done. Show classes',
        }),
      ).toHaveFocus();
    });
  });
});
