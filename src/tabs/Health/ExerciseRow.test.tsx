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
    <ul>
      <ExerciseRow exercise={rdl} />
    </ul>,
    overrides,
  );
}

async function openRecordForm() {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: 'Record B-stance RDL' });
  await user.click(button);
  return { user, button };
}

async function openEditForm() {
  const user = userEvent.setup();
  const chip = screen.getByRole('button', { name: /16 Aug 26/ });
  await user.click(chip);
  return { user, chip };
}

describe('ExerciseRow', () => {
  it('is labelled with the exercise name', () => {
    renderExerciseRow();

    expect(
      screen.getByRole('listitem', { name: 'B-stance RDL' }),
    ).toBeInTheDocument();
  });

  describe('the updates', () => {
    it('shows them in date order', () => {
      renderExerciseRow();

      const updates = within(
        screen.getByRole('listitem', { name: 'B-stance RDL' }),
      ).getAllByRole('button', { name: /Aug 26/ });
      expect(updates.map((update) => update.textContent)).toEqual([
        '12 Aug 263 x 10 x 16kg',
        '16 Aug 263 x 10 x 20kg',
        '20 Aug 263 x 10 x 22kg',
      ]);
    });
  });

  describe('when the record button is pressed', () => {
    it('opens the record form', async () => {
      renderExerciseRow();

      const { button } = await openRecordForm();

      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(
        screen.getByRole('form', { name: 'Record B-stance RDL' }),
      ).toBeInTheDocument();
    });

    describe('again', () => {
      it('closes the form', async () => {
        renderExerciseRow();
        const { user, button } = await openRecordForm();
        const form = screen.getByRole('form', { name: 'Record B-stance RDL' });

        await user.click(button);

        expect(form).not.toBeInTheDocument();
        expect(button).toHaveFocus();
      });
    });
  });

  describe('when the record form is saved', () => {
    it('records the update against the exercise', async () => {
      const recordExercise = jest.fn();
      renderExerciseRow({ recordExercise });
      const { user } = await openRecordForm();

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
      const { user, button } = await openRecordForm();
      const form = screen.getByRole('form', { name: 'Record B-stance RDL' });

      await user.type(
        screen.getByRole('textbox', { name: 'Details' }),
        '3 x 10 x 24kg',
      );
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(form).not.toBeInTheDocument();
      expect(button).toHaveFocus();
    });
  });

  describe('when the record form is cancelled', () => {
    it('closes the form and returns focus to the record button', async () => {
      renderExerciseRow();
      const { user, button } = await openRecordForm();
      const form = screen.getByRole('form', { name: 'Record B-stance RDL' });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(form).not.toBeInTheDocument();
      expect(button).toHaveFocus();
    });
  });

  describe('when an update is pressed', () => {
    it('opens a form filled in with the update', async () => {
      renderExerciseRow();

      const { chip } = await openEditForm();

      expect(chip).toHaveAttribute('aria-expanded', 'true');
      const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });
      expect(within(form).getByLabelText('Date')).toHaveValue('2026-08-16');
      expect(
        within(form).getByRole('textbox', { name: 'Details' }),
      ).toHaveValue('3 x 10 x 20kg');
    });

    describe('again', () => {
      it('closes the form', async () => {
        renderExerciseRow();
        const { user, chip } = await openEditForm();
        const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });

        await user.click(chip);

        expect(form).not.toBeInTheDocument();
        expect(chip).toHaveFocus();
      });
    });

    describe('and then another update is pressed', () => {
      it('fills the form in with the other update', async () => {
        renderExerciseRow();
        const { user } = await openEditForm();

        await user.click(screen.getByRole('button', { name: /20 Aug 26/ }));

        expect(screen.getByRole('textbox', { name: 'Details' })).toHaveValue(
          '3 x 10 x 22kg',
        );
      });
    });

    describe('and then the record button is pressed', () => {
      it('swaps the edit form for the record form', async () => {
        renderExerciseRow();
        const { user } = await openEditForm();
        const editForm = screen.getByRole('form', {
          name: 'Edit B-stance RDL',
        });

        await user.click(
          screen.getByRole('button', { name: 'Record B-stance RDL' }),
        );

        expect(editForm).not.toBeInTheDocument();
        expect(
          screen.getByRole('form', { name: 'Record B-stance RDL' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('when an edit is saved', () => {
    it('replaces the stored update', async () => {
      const editExerciseUpdate = jest.fn();
      renderExerciseRow({ editExerciseUpdate });
      const { user } = await openEditForm();

      const details = screen.getByRole('textbox', { name: 'Details' });
      await user.clear(details);
      await user.type(details, '3 x 10 x 18kg');
      await user.click(screen.getByRole('radio', { name: 'increase' }));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(editExerciseUpdate).toHaveBeenCalledWith('rdl', {
        id: 'b',
        date: '2026-08-16',
        details: '3 x 10 x 18kg',
        recommendation: 'increase',
      });
    });

    it('closes the form and returns focus to the update', async () => {
      renderExerciseRow();
      const { user, chip } = await openEditForm();
      const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(form).not.toBeInTheDocument();
      expect(chip).toHaveFocus();
    });
  });

  describe('when an edit is cancelled', () => {
    it('closes the form and returns focus to the update', async () => {
      renderExerciseRow();
      const { user, chip } = await openEditForm();
      const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(form).not.toBeInTheDocument();
      expect(chip).toHaveFocus();
    });
  });

  describe('when an update is deleted', () => {
    describe('with one press of delete', () => {
      it('asks for confirmation instead of deleting', async () => {
        const deleteExerciseUpdate = jest.fn();
        renderExerciseRow({ deleteExerciseUpdate });
        const { user } = await openEditForm();

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(
          screen.getByRole('button', { name: 'Confirm delete' }),
        ).toBeInTheDocument();
        expect(deleteExerciseUpdate).not.toHaveBeenCalled();
      });
    });

    describe('with a second press', () => {
      it('deletes it from the exercise', async () => {
        const deleteExerciseUpdate = jest.fn();
        renderExerciseRow({ deleteExerciseUpdate });
        const { user } = await openEditForm();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(
          screen.getByRole('button', { name: 'Confirm delete' }),
        );

        expect(deleteExerciseUpdate).toHaveBeenCalledWith(
          'rdl',
          rdl.updates?.b,
        );
      });

      it('closes the form and moves focus to the record button', async () => {
        renderExerciseRow();
        const { user } = await openEditForm();
        const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(
          screen.getByRole('button', { name: 'Confirm delete' }),
        );

        expect(form).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Record B-stance RDL' }),
        ).toHaveFocus();
      });
    });

    describe('when focus moves away before the second press', () => {
      it('asks for confirmation again', async () => {
        const deleteExerciseUpdate = jest.fn();
        renderExerciseRow({ deleteExerciseUpdate });
        const { user } = await openEditForm();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.tab();
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(
          screen.getByRole('button', { name: 'Confirm delete' }),
        ).toBeInTheDocument();
        expect(deleteExerciseUpdate).not.toHaveBeenCalled();
      });
    });
  });
});
