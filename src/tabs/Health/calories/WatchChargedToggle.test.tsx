import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WatchChargedToggle } from './WatchChargedToggle';

describe('WatchChargedToggle', () => {
  describe('when the pointer moves over the toggle', () => {
    it('shows what it tracks', async () => {
      render(<WatchChargedToggle charged={false} onChange={jest.fn()} />);

      await userEvent.hover(
        screen.getByRole('button', { name: 'watch charged' }),
      );

      expect(screen.getByText('watch charged')).toBeVisible();
    });
  });
});
