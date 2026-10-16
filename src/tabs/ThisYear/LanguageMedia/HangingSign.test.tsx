import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HangingSign } from './HangingSign';

describe('HangingSign', () => {
  describe('when tapped', () => {
    it('calls onClick', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(<HangingSign label="Update" icon="📖" onClick={onClick} />);

      await user.click(screen.getByRole('button', { name: 'Update' }));

      expect(onClick).toHaveBeenCalled();
    });
  });
});
