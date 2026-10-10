import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateDaysAgo, getToday } from '../../shared/dates';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { DeadHangCard } from './DeadHangCard';

function setUpUser() {
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
}

function passSeconds(seconds: number) {
  act(() => {
    jest.advanceTimersByTime(seconds * 1000);
  });
}

describe('DeadHangCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('a hang', () => {
    it('counts from a second after start is pressed', async () => {
      const user = setUpUser();
      renderWithHealthStorage(<DeadHangCard />);

      await user.click(screen.getByRole('button', { name: 'Start hang' }));
      passSeconds(1);
      const stop = screen.getByRole('button', { name: 'Stop hang' });
      expect(stop).toHaveTextContent('0');

      passSeconds(5);
      expect(stop).toHaveTextContent('5');
    });

    it('records the time between the first second and the last', async () => {
      const user = setUpUser();
      const { storageContext } = renderWithHealthStorage(<DeadHangCard />);

      await user.click(screen.getByRole('button', { name: 'Start hang' }));
      passSeconds(14);
      await user.click(screen.getByRole('button', { name: 'Stop hang' }));

      expect(storageContext.setDeadHang).toHaveBeenCalledWith({
        date: getToday(),
        hangs: [12],
      });
    });

    describe('that is stopped before it gets going', () => {
      it('is not recorded', async () => {
        const user = setUpUser();
        const { storageContext } = renderWithHealthStorage(<DeadHangCard />);

        await user.click(screen.getByRole('button', { name: 'Start hang' }));
        passSeconds(1.5);
        await user.click(screen.getByRole('button', { name: 'Stop hang' }));

        expect(storageContext.setDeadHang).not.toHaveBeenCalled();
        expect(
          screen.getByRole('button', { name: 'Start hang' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('the session', () => {
    describe('when there are hangs from today', () => {
      it('shows the total and the longest hang', () => {
        renderWithHealthStorage(<DeadHangCard />, {
          deadHang: { date: getToday(), hangs: [12, 9, 14] },
        });

        expect(
          screen.getByRole('img', {
            name: '35 of 60 seconds today, longest hang 14 of 30 seconds',
          }),
        ).toBeInTheDocument();
      });

      it('adds a new hang to them', async () => {
        const user = setUpUser();
        const { storageContext } = renderWithHealthStorage(<DeadHangCard />, {
          deadHang: { date: getToday(), hangs: [12, 9] },
        });

        await user.click(screen.getByRole('button', { name: 'Start hang' }));
        passSeconds(10);
        await user.click(screen.getByRole('button', { name: 'Stop hang' }));

        expect(storageContext.setDeadHang).toHaveBeenCalledWith({
          date: getToday(),
          hangs: [12, 9, 8],
        });
      });
    });

    describe('when the last hangs were on an earlier day', () => {
      it('starts a new session', async () => {
        const user = setUpUser();
        const { storageContext } = renderWithHealthStorage(<DeadHangCard />, {
          deadHang: { date: getDateDaysAgo(1), hangs: [12, 9] },
        });

        expect(
          screen.getByRole('img', {
            name: '0 of 60 seconds today, longest hang 0 of 30 seconds',
          }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Start hang' }));
        passSeconds(7);
        await user.click(screen.getByRole('button', { name: 'Stop hang' }));

        expect(storageContext.setDeadHang).toHaveBeenCalledWith({
          date: getToday(),
          hangs: [5],
        });
      });
    });
  });
});
