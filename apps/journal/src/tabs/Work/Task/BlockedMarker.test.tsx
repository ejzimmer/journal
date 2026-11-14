import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockedMarker } from './BlockedMarker';

describe('BlockedMarker', () => {
  describe('when the task is not blocked', () => {
    describe('and the user opens the menu and picks a stamp', () => {
      it('sets that blocking stamp on the task', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<BlockedMarker onChange={onChange} />);

        await user.click(
          screen.getByRole('button', { name: 'Mark as blocked' }),
        );
        await user.click(
          screen.getByRole('button', { name: 'Blocked on time', hidden: true }),
        );

        expect(onChange).toHaveBeenCalledWith('time');
      });
    });
  });

  describe('when the task is blocked', () => {
    it('labels the stamp with what the task is blocked on', () => {
      render(<BlockedMarker blockedOn="human" onChange={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: 'Blocked on human' }),
      ).toBeInTheDocument();
    });

    describe('and the user opens the menu and picks another stamp', () => {
      it('replaces the blocking stamp on the task with that one', async () => {
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
    });

    describe('and the user opens the menu and picks the bin', () => {
      it('removes the blocking stamp from the task', async () => {
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
});
