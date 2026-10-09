import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteWithConfirmation } from './DeleteWithConfirmation';

const renderDeleteWithConfirmation = () => {
  const onDelete = jest.fn();
  render(
    <>
      <DeleteWithConfirmation onDelete={onDelete} />
      <button type="button">Elsewhere</button>
    </>,
  );
  return { onDelete, user: userEvent.setup() };
};

describe('DeleteWithConfirmation', () => {
  describe('when the bin is clicked', () => {
    it('asks for confirmation instead of deleting', async () => {
      const { onDelete, user } = renderDeleteWithConfirmation();

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(
        screen.getByRole('button', { name: 'Confirm delete' }),
      ).toHaveClass('confirming');
      expect(onDelete).not.toHaveBeenCalled();
    });

    describe('and clicked again', () => {
      it('deletes', async () => {
        const { onDelete, user } = renderDeleteWithConfirmation();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(
          screen.getByRole('button', { name: 'Confirm delete' }),
        );

        expect(onDelete).toHaveBeenCalled();
      });
    });

    describe('and focus moves away', () => {
      it('goes back to asking for a first click', async () => {
        const { onDelete, user } = renderDeleteWithConfirmation();

        await user.click(screen.getByRole('button', { name: 'Delete' }));
        await user.click(screen.getByRole('button', { name: 'Elsewhere' }));
        await user.click(screen.getByRole('button', { name: 'Delete' }));

        expect(
          screen.getByRole('button', { name: 'Confirm delete' }),
        ).toBeInTheDocument();
        expect(onDelete).not.toHaveBeenCalled();
      });
    });
  });
});
