import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseTracker } from './ExerciseTracker';
import { renderWithStorage } from '../../shared/storageContextTestUtils';
import { Exercise, EXERCISES_PATH } from '../../shared/types';
import { ContextType } from '../../shared/FirebaseContext';

const exercises: Record<string, Exercise> = {
  pistol: {
    id: 'pistol',
    name: 'Box pistol squat',
    updates: {
      a: {
        id: 'a',
        date: '2026-08-12',
        details: '1 x 5 3 mats + 2 low yoga blocks (eccentric only)',
      },
    },
  },
  split: {
    id: 'split',
    name: 'Bulgarian split squat',
    updates: {
      a: {
        id: 'a',
        date: '2026-08-12',
        details: '3 x 10 x 8kg',
        recommendation: 'increase',
      },
    },
  },
  rdl: {
    id: 'rdl',
    name: 'B-stance RDL',
    updates: {
      c: { id: 'c', date: '2026-08-20', details: '3 x 10 x 22kg' },
      a: { id: 'a', date: '2026-08-12', details: '3 x 10 x 16kg' },
      b: { id: 'b', date: '2026-08-16', details: '3 x 10 x 20kg' },
    },
  },
  plank: {
    id: 'plank',
    name: 'Plank',
  },
};

function renderTracker(value: Partial<ContextType> = {}) {
  const useValue = jest.fn((key?: string) => ({
    loading: false,
    value: key === EXERCISES_PATH ? exercises : undefined,
  }));
  return renderWithStorage(<ExerciseTracker />, {
    value: { useValue: useValue as ContextType['useValue'], ...value },
  });
}

const getRow = (name: string) =>
  screen.getByRole('row', { name: new RegExp(name) });

describe('ExerciseTracker', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setTimeout'] });
    jest.setSystemTime(new Date('2026-09-02T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('the table', () => {
    it('shows each update with its date and details', () => {
      renderTracker();

      const update = within(getRow('Box pistol squat')).getByRole('cell', {
        name: /12 Aug 26/,
      });
      expect(update).toHaveTextContent(/3 mats \+ 2 low yoga blocks/);
    });

    it("shows each exercise's updates in date order", () => {
      renderTracker();

      const cells = within(getRow('B-stance RDL')).getAllByRole('cell');
      expect(cells.slice(0, 3).map((cell) => cell.textContent)).toEqual([
        '12 Aug 263 x 10 x 16kg',
        '16 Aug 263 x 10 x 20kg',
        '20 Aug 263 x 10 x 22kg',
      ]);
    });

    it('shows the recommendation on an update that has one', () => {
      renderTracker();

      const update = within(getRow('Bulgarian split squat')).getByRole('cell', {
        name: /12 Aug 26/,
      });
      expect(
        within(update).getByRole('img', { name: 'increase' }),
      ).toBeInTheDocument();
    });

    it('has one more update column than the exercise with the most updates', () => {
      renderTracker();

      for (const name of [
        'Box pistol squat',
        'Bulgarian split squat',
        'B-stance RDL',
        'Plank',
      ]) {
        expect(within(getRow(name)).getAllByRole('cell')).toHaveLength(4);
      }
    });

    describe('the record button', () => {
      it('sits in the first empty cell of the row', () => {
        renderTracker();

        const pistolCells = within(getRow('Box pistol squat')).getAllByRole(
          'cell',
        );
        expect(
          within(pistolCells[1]).getByRole('button', {
            name: 'Record Box pistol squat',
          }),
        ).toBeInTheDocument();

        const plankCells = within(getRow('Plank')).getAllByRole('cell');
        expect(
          within(plankCells[0]).getByRole('button', { name: 'Record Plank' }),
        ).toBeInTheDocument();

        const rdlCells = within(getRow('B-stance RDL')).getAllByRole('cell');
        expect(
          within(rdlCells[3]).getByRole('button', {
            name: 'Record B-stance RDL',
          }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('recording an exercise', () => {
    async function openForm(name: string) {
      const user = userEvent.setup();
      const button = screen.getByRole('button', { name: `Record ${name}` });
      await user.click(button);
      return { user, button };
    }

    describe('when the record button is pressed', () => {
      it('replaces the button with the form, in the same cell', async () => {
        renderTracker();
        const cell = within(getRow('Box pistol squat')).getAllByRole('cell')[1];

        const { button } = await openForm('Box pistol squat');

        expect(button).not.toBeInTheDocument();
        expect(
          within(cell).getByRole('form', { name: 'Record Box pistol squat' }),
        ).toBeInTheDocument();
      });

      it("focuses the date, which defaults to today's", async () => {
        renderTracker();

        await openForm('Box pistol squat');

        const date = screen.getByLabelText('Date');
        expect(date).toHaveFocus();
        expect(date).toHaveValue('2026-09-02');
      });

      it('defaults the recommendation to no change', async () => {
        renderTracker();

        await openForm('Box pistol squat');

        expect(screen.getByRole('radio', { name: 'no change' })).toBeChecked();
      });
    });

    describe('when the form is submitted', () => {
      it('adds the update to the exercise', async () => {
        const addItem = jest.fn();
        renderTracker({ addItem });
        const { user } = await openForm('Bulgarian split squat');

        const date = screen.getByLabelText('Date');
        await user.clear(date);
        await user.type(date, '2026-09-20');
        await user.type(
          screen.getByRole('textbox', { name: 'Details' }),
          '3 x 10 x 10kg',
        );
        await user.click(screen.getByRole('radio', { name: 'decrease' }));
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(addItem).toHaveBeenCalledWith(
          `${EXERCISES_PATH}/split/updates`,
          {
            date: '2026-09-20',
            details: '3 x 10 x 10kg',
            recommendation: 'decrease',
          },
        );
      });

      it('closes the form and returns focus to the record button', async () => {
        renderTracker();
        const { user } = await openForm('Bulgarian split squat');
        const form = screen.getByRole('form', {
          name: 'Record Bulgarian split squat',
        });

        await user.type(
          screen.getByRole('textbox', { name: 'Details' }),
          '3 x 10 x 10kg',
        );
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(form).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Record Bulgarian split squat' }),
        ).toHaveFocus();
      });

      describe('with no change recommended', () => {
        it('adds the update without a recommendation', async () => {
          const addItem = jest.fn();
          renderTracker({ addItem });
          const { user } = await openForm('Bulgarian split squat');

          await user.type(
            screen.getByRole('textbox', { name: 'Details' }),
            '3 x 10 x 10kg',
          );
          await user.click(screen.getByRole('button', { name: 'Save' }));

          expect(addItem).toHaveBeenCalledWith(
            `${EXERCISES_PATH}/split/updates`,
            { date: '2026-09-02', details: '3 x 10 x 10kg' },
          );
        });
      });

      describe('without any details', () => {
        it("doesn't add an update", async () => {
          const addItem = jest.fn();
          renderTracker({ addItem });
          const { user } = await openForm('Bulgarian split squat');

          await user.click(screen.getByRole('button', { name: 'Save' }));

          expect(addItem).not.toHaveBeenCalled();
        });
      });
    });

    describe('when the form is cancelled', () => {
      it.each([
        [
          'with the cancel button',
          (user: ReturnType<typeof userEvent.setup>) =>
            user.click(screen.getByRole('button', { name: 'Cancel' })),
        ],
        [
          'with escape',
          (user: ReturnType<typeof userEvent.setup>) =>
            user.keyboard('{Escape}'),
        ],
      ])('closes the form %s', async (_, cancel) => {
        renderTracker();
        const { user } = await openForm('Plank');
        const form = screen.getByRole('form', { name: 'Record Plank' });

        await cancel(user);

        expect(form).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Record Plank' }),
        ).toHaveFocus();
      });
    });
  });

  describe('adding an exercise', () => {
    async function openAddExerciseForm() {
      const user = userEvent.setup();
      const button = screen.getByRole('button', { name: 'Add exercise' });
      await user.click(button);
      return { user, button };
    }

    describe('when the add exercise button is pressed', () => {
      it('replaces the button with a focused name field', async () => {
        renderTracker();

        const { button } = await openAddExerciseForm();

        expect(button).not.toBeInTheDocument();
        expect(
          screen.getByRole('textbox', { name: 'Exercise name' }),
        ).toHaveFocus();
      });
    });

    describe('when a name is entered', () => {
      it('adds the exercise', async () => {
        const addItem = jest.fn();
        renderTracker({ addItem });
        const { user } = await openAddExerciseForm();

        await user.keyboard('Goblet squat{Enter}');

        expect(addItem).toHaveBeenCalledWith(EXERCISES_PATH, {
          name: 'Goblet squat',
        });
      });

      it('closes the form and returns focus to the add exercise button', async () => {
        renderTracker();
        const { user } = await openAddExerciseForm();
        const input = screen.getByRole('textbox', { name: 'Exercise name' });

        await user.keyboard('Goblet squat{Enter}');

        expect(input).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Add exercise' }),
        ).toHaveFocus();
      });
    });

    describe('when the name is empty', () => {
      it("doesn't add an exercise", async () => {
        const addItem = jest.fn();
        renderTracker({ addItem });
        const { user } = await openAddExerciseForm();

        await user.keyboard('   {Enter}');

        expect(addItem).not.toHaveBeenCalled();
      });
    });

    describe('when escape is pressed', () => {
      it('closes the form', async () => {
        renderTracker();
        const { user } = await openAddExerciseForm();
        const input = screen.getByRole('textbox', { name: 'Exercise name' });

        await user.keyboard('{Escape}');

        expect(input).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Add exercise' }),
        ).toHaveFocus();
      });
    });
  });
});
