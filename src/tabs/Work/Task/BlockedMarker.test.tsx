import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getToday } from '../../../shared/dates';
import { BlockedMarker } from './BlockedMarker';

describe('BlockedMarker', () => {
  describe('when the task is not blocked', () => {
    it('blocks it on the chosen stamp', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<BlockedMarker onChange={onChange} />);

      await user.click(screen.getByRole('button', { name: 'Mark as blocked' }));
      await user.click(
        screen.getByRole('button', { name: 'Blocked on build', hidden: true }),
      );

      expect(onChange).toHaveBeenCalledWith({ on: 'build' });
    });

    describe('choosing the clock stamp', () => {
      it('blocks it until the time entered', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<BlockedMarker onChange={onChange} />);

        await user.click(
          screen.getByRole('button', { name: 'Mark as blocked' }),
        );
        await user.click(
          screen.getByRole('button', {
            name: 'Blocked until a time',
            hidden: true,
          }),
        );
        fireEvent.change(screen.getByLabelText('Blocked until'), {
          target: { value: '2099-01-02T09:30' },
        });
        await user.click(
          screen.getByRole('button', { name: 'Save blocked until' }),
        );

        expect(onChange).toHaveBeenCalledWith({
          on: 'time',
          until: '2099-01-02T09:30',
        });
      });

      it('closes the time picker on escape', async () => {
        const user = userEvent.setup();
        render(<BlockedMarker onChange={jest.fn()} />);

        await user.click(
          screen.getByRole('button', { name: 'Mark as blocked' }),
        );
        await user.click(
          screen.getByRole('button', {
            name: 'Blocked until a time',
            hidden: true,
          }),
        );
        const input = screen.getByLabelText('Blocked until');
        await user.keyboard('{Escape}');

        expect(input).not.toBeInTheDocument();
      });
    });
  });

  describe('when the task is blocked', () => {
    it('describes what it is blocked on', () => {
      render(<BlockedMarker blocked={{ on: 'human' }} onChange={jest.fn()} />);

      expect(
        screen.getByRole('button', { name: 'Blocked on human' }),
      ).toBeInTheDocument();
    });

    it('moves it to another stamp', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<BlockedMarker blocked={{ on: 'human' }} onChange={onChange} />);

      await user.click(
        screen.getByRole('button', { name: 'Blocked on human' }),
      );
      await user.click(
        screen.getByRole('button', {
          name: 'Blocked on merge queue',
          hidden: true,
        }),
      );

      expect(onChange).toHaveBeenCalledWith({ on: 'merge_queue' });
    });

    it('unblocks it', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<BlockedMarker blocked={{ on: 'human' }} onChange={onChange} />);

      await user.click(
        screen.getByRole('button', { name: 'Blocked on human' }),
      );
      await user.click(
        screen.getByRole('button', { name: 'Unblock', hidden: true }),
      );

      expect(onChange).toHaveBeenCalledWith(undefined);
    });

    describe('until a time', () => {
      describe('later today', () => {
        it('shows just the time', () => {
          render(
            <BlockedMarker
              blocked={{ on: 'time', until: `${getToday()}T16:45` }}
              onChange={jest.fn()}
            />,
          );

          const stamp = screen.getByRole('button', {
            name: 'Blocked until 16:45',
          });
          expect(stamp).toHaveAttribute('title', '16:45');
        });
      });

      describe('on another day', () => {
        it('shows the date and time', () => {
          render(
            <BlockedMarker
              blocked={{ on: 'time', until: '2099-01-02T09:30' }}
              onChange={jest.fn()}
            />,
          );

          const stamp = screen.getByRole('button', {
            name: 'Blocked until 02 Jan 09:30',
          });
          expect(stamp).toHaveAttribute('title', '02 Jan 09:30');
        });
      });

      it('starts the time picker at the current blocked time', async () => {
        const user = userEvent.setup();
        render(
          <BlockedMarker
            blocked={{ on: 'time', until: '2099-01-02T09:30' }}
            onChange={jest.fn()}
          />,
        );

        await user.click(
          screen.getByRole('button', { name: 'Blocked until 02 Jan 09:30' }),
        );
        await user.click(
          screen.getByRole('button', {
            name: 'Blocked until a time',
            hidden: true,
          }),
        );

        expect(screen.getByLabelText('Blocked until')).toHaveValue(
          '2099-01-02T09:30',
        );
      });
    });
  });
});
