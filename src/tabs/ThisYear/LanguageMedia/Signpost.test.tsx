import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Signpost } from './Signpost';

describe('Signpost', () => {
  describe('when clicked', () => {
    it('calls onClick', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <Signpost name="Les Misérables" isOpen={false} onClick={onClick} />,
      );

      await user.click(screen.getByRole('button', { name: 'Les Misérables' }));

      expect(onClick).toHaveBeenCalled();
    });
  });
});
