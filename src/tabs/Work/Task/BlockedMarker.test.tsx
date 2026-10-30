import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockedMarker } from './BlockedMarker';

describe('BlockedMarker', () => {
  describe('when the task is not blocked', () => {
    it('blocks it on the chosen stamp', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<BlockedMarker onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'Mark as blocked' }));
      await user.click(
        screen.getByRole('button', { name: 'Blocked on time', hidden: true }),
      );

      expect(onChange).toHaveBeenCalledWith('time');
    });
  });

  describe('when the task is blocked', () => {
    it('describes what it is blocked on', () => {
      render(<BlockedMarker blockedOn="human" onChange={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: 'Blocked on human' }),
      ).toBeInTheDocument();
    });

    it('moves it to another stamp', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<BlockedMarker blockedOn="human" onChange={onChange} />);

      await user.click(
        screen.getByRole('button', { name: 'Blocked on human' }),
      );
      await user.click(
        screen.getByRole('button', {
          name: 'Blocked on merge queue',
          hidden: true,
        }),
      );

      expect(onChange).toHaveBeenCalledWith('merge_queue');
    });

    it('unblocks it', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<BlockedMarker blockedOn="human" onChange={onChange} />);

      await user.click(
        screen.getByRole('button', { name: 'Blocked on human' }),
      );
      await user.click(
        screen.getByRole('button', { name: 'Unblock', hidden: true }),
      );

      expect(onChange).toHaveBeenCalledWith(undefined);
    });
  });
});
