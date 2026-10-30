import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockedMarker } from './BlockedMarker';

describe('BlockedMarker', () => {
  describe('when the task is not blocked', () => {
    it('blocks the task on time when the clock stamp is picked', async () => {
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
    it('labels the stamp with what the task is blocked on', () => {
      render(<BlockedMarker blockedOn="human" onChange={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: 'Blocked on human' }),
      ).toBeInTheDocument();
    });

    it('switches the task to the merge queue when the merge stamp is picked', async () => {
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

    it('unblocks the task when the bin is picked', async () => {
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
