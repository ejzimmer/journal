import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteWithConfirmation } from './DeleteWithConfirmation';

const renderDeleteWithConfirmation = () => {
  const onDelete = jest.fn();
  render(
    <DeleteWithConfirmation onDelete={onDelete}>
      <button type="button">Save</button>
    </DeleteWithConfirmation>,
  );
  return { onDelete, user: userEvent.setup() };
};

describe('DeleteWithConfirmation', () => {
  it('shows the bin alongside the other actions', () => {
    renderDeleteWithConfirmation();

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  describe('when the bin is clicked', () => {
    it('swaps the actions for a confirm and a cancel', async () => {
      const { user } = renderDeleteWithConfirmation();
      const save = screen.getByRole('button', { name: 'Save' });

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(save).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Confirm delete' }),
      ).toHaveFocus();
      expect(
        screen.getByRole('button', { name: 'Cancel delete' }),
      ).toBeInTheDocument();
    });

    describe('and the delete is confirmed', () => {
      it('deletes', async () => {
        const { onDelete, user } = renderDeleteWithConfirmation();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(
          screen.getByRole('button', { name: 'Confirm delete' }),
        );

        expect(onDelete).toHaveBeenCalled();
      });
    });

    describe('and the delete is cancelled', () => {
      it('brings back the actions with focus on the bin', async () => {
        const { onDelete, user } = renderDeleteWithConfirmation();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        const confirmButton = screen.getByRole('button', {
          name: 'Confirm delete',
        });
        await user.click(screen.getByRole('button', { name: 'Cancel delete' }));

        expect(confirmButton).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Delete' })).toHaveFocus();
        expect(
          screen.getByRole('button', { name: 'Save' }),
        ).toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();
      });
    });
  });
});
