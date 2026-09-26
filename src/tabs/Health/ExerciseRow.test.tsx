import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseRow } from './ExerciseRow';
import { Exercise } from '../../shared/types';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { HealthStorageContextType } from './HealthStorageContext';

const rdl: Exercise = {
  id: 'rdl',
  name: 'B-stance RDL',
  updates: {
    c: { id: 'c', date: '2026-08-20', details: '3 x 10 x 22kg' },
    a: {
      id: 'a',
      date: '2026-08-12',
      details: '3 x 10 x 16kg',
      recommendation: 'increase',
    },
    b: { id: 'b', date: '2026-08-16', details: '3 x 10 x 20kg' },
  },
};

function renderExerciseRow(overrides: Partial<HealthStorageContextType> = {}) {
  return renderWithHealthStorage(
    <table>
      <tbody>
        <ExerciseRow exercise={rdl} numberOfUpdateColumns={5} />
      </tbody>
    </table>,
    overrides,
  );
}

async function openForm() {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: 'Record B-stance RDL' });
  await user.click(button);
  return { user, button };
}

describe('ExerciseRow', () => {
  describe('the updates', () => {
    it('shows them in date order', () => {
      renderExerciseRow();

      const cells = screen.getAllByRole('cell');
      expect(cells.slice(0, 3).map((cell) => cell.textContent)).toEqual([
        '12 Aug 263 x 10 x 16kg',
        '16 Aug 263 x 10 x 20kg',
        '20 Aug 263 x 10 x 22kg',
      ]);
    });

    it('shows the recommendation on an update that has one', () => {
      renderExerciseRow();

      const update = screen.getByRole('cell', { name: /12 Aug 26/ });
      expect(
        within(update).getByRole('img', { name: 'increase' }),
      ).toBeInTheDocument();
    });
  });

  describe('the empty cells', () => {
    it('fill the row out to the number of update columns', () => {
      renderExerciseRow();

      expect(screen.getAllByRole('cell')).toHaveLength(5);
    });

    it('have the record button in the first one', () => {
      renderExerciseRow();

      expect(
        within(screen.getAllByRole('cell')[3]).getByRole('button', {
          name: 'Record B-stance RDL',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('when the record button is pressed', () => {
    it('replaces the button with the form, in the same cell', async () => {
      renderExerciseRow();
      const cell = screen.getAllByRole('cell')[3];

      const { button } = await openForm();

      expect(button).not.toBeInTheDocument();
      expect(
        within(cell).getByRole('form', { name: 'Record B-stance RDL' }),
      ).toBeInTheDocument();
    });
  });

  describe('when the form is saved', () => {
    it('records the update against the exercise', async () => {
      const recordExercise = jest.fn();
      renderExerciseRow({ recordExercise });
      const { user } = await openForm();

      await user.type(
        screen.getByRole('textbox', { name: 'Details' }),
        '3 x 10 x 24kg',
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(recordExercise).toHaveBeenCalledWith(
        'rdl',
        expect.objectContaining({ details: '3 x 10 x 24kg' }),
      );
    });

    it('closes the form and returns focus to the record button', async () => {
      renderExerciseRow();
      const { user } = await openForm();
      const form = screen.getByRole('form', { name: 'Record B-stance RDL' });

      await user.type(
        screen.getByRole('textbox', { name: 'Details' }),
        '3 x 10 x 24kg',
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(form).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Record B-stance RDL' }),
      ).toHaveFocus();
    });
  });

  describe('when the form is cancelled', () => {
    it('closes the form and returns focus to the record button', async () => {
      renderExerciseRow();
      const { user } = await openForm();
      const form = screen.getByRole('form', { name: 'Record B-stance RDL' });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(form).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Record B-stance RDL' }),
      ).toHaveFocus();
    });
  });
});
