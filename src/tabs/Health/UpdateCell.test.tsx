import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Exercise, ExerciseUpdate } from '../../shared/types';
import { UpdateCell } from './UpdateCell';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { HealthStorageContextType } from './HealthStorageContext';

const rdl: Exercise = { id: 'rdl', name: 'B-stance RDL' };
const update: ExerciseUpdate = {
  id: 'a',
  date: '2026-08-12',
  details: '3 x 10 x 16kg',
  recommendation: 'increase',
};

function renderUpdateCell(overrides: Partial<HealthStorageContextType> = {}) {
  return renderWithHealthStorage(
    <table>
      <tbody>
        <tr>
          <UpdateCell exercise={rdl} update={update} />
        </tr>
      </tbody>
    </table>,
    overrides,
  );
}

async function openEditForm() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /12 Aug 26/ }));
  return { user };
}

describe('UpdateCell', () => {
  it('shows the date, details and recommendation', () => {
    renderUpdateCell();

    const button = screen.getByRole('button', { name: /12 Aug 26/ });
    expect(button).toHaveTextContent('3 x 10 x 16kg');
    expect(
      within(button).getByRole('img', { name: 'increase' }),
    ).toBeInTheDocument();
  });

  describe('when the update is pressed', () => {
    it('opens a form filled in with the update', async () => {
      renderUpdateCell();

      await openEditForm();

      const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });
      expect(within(form).getByLabelText('Date')).toHaveValue('2026-08-12');
      expect(
        within(form).getByRole('textbox', { name: 'Details' }),
      ).toHaveValue('3 x 10 x 16kg');
      expect(
        within(form).getByRole('radio', { name: 'increase' }),
      ).toBeChecked();
    });
  });

  describe('when the edit is saved', () => {
    it('replaces the stored update', async () => {
      const editExerciseUpdate = jest.fn();
      renderUpdateCell({ editExerciseUpdate });
      const { user } = await openEditForm();

      const details = screen.getByRole('textbox', { name: 'Details' });
      await user.clear(details);
      await user.type(details, '3 x 10 x 18kg');
      await user.click(screen.getByRole('radio', { name: 'no change' }));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(editExerciseUpdate).toHaveBeenCalledWith('rdl', {
        id: 'a',
        date: '2026-08-12',
        details: '3 x 10 x 18kg',
      });
    });

    it('closes the form and returns focus to the update', async () => {
      renderUpdateCell();
      const { user } = await openEditForm();
      const form = screen.getByRole('form', { name: 'Edit B-stance RDL' });

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(form).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /12 Aug 26/ })).toHaveFocus();
    });
  });

  describe('when the update is deleted', () => {
    describe('with one press of delete', () => {
      it('asks for confirmation instead of deleting', async () => {
        const deleteExerciseUpdate = jest.fn();
        renderUpdateCell({ deleteExerciseUpdate });
        const { user } = await openEditForm();

        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(
          screen.getByRole('button', { name: 'Confirm delete' }),
        ).toBeInTheDocument();
        expect(deleteExerciseUpdate).not.toHaveBeenCalled();
      });
    });

    describe('with a second press', () => {
      it('deletes the stored update', async () => {
        const deleteExerciseUpdate = jest.fn();
        renderUpdateCell({ deleteExerciseUpdate });
        const { user } = await openEditForm();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(
          screen.getByRole('button', { name: 'Confirm delete' }),
        );

        expect(deleteExerciseUpdate).toHaveBeenCalledWith('rdl', update);
      });
    });

    describe('when focus moves away before the second press', () => {
      it('asks for confirmation again', async () => {
        const deleteExerciseUpdate = jest.fn();
        renderUpdateCell({ deleteExerciseUpdate });
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
