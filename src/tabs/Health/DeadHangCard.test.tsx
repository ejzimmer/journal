import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateDaysAgo, getToday } from '../../shared/dates';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { DeadHangCard } from './DeadHangCard';

describe('DeadHangCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('a hang', () => {
    it('counts from a second after start is pressed', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithHealthStorage(<DeadHangCard />);

      await user.click(screen.getByRole('button', { name: 'Start hang' }));
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      const stop = screen.getByRole('button', { name: 'Stop hang' });
      expect(stop).toHaveTextContent('0');

      act(() => {
        jest.advanceTimersByTime(5000);
      });
      expect(stop).toHaveTextContent('5');
    });

    it('records the time between the first second and the last', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const { storageContext } = renderWithHealthStorage(<DeadHangCard />);

      await user.click(screen.getByRole('button', { name: 'Start hang' }));
      act(() => {
        jest.advanceTimersByTime(14_000);
      });
      await user.click(screen.getByRole('button', { name: 'Stop hang' }));

      expect(storageContext.updateDeadHang).toHaveBeenCalledWith({
        date: getToday(),
        hangs: [12],
        bestHang: 12,
      });
    });

    describe('that is stopped before it gets going', () => {
      it('is not recorded', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const { storageContext } = renderWithHealthStorage(<DeadHangCard />);

        await user.click(screen.getByRole('button', { name: 'Start hang' }));
        act(() => {
          jest.advanceTimersByTime(1500);
        });
        await user.click(screen.getByRole('button', { name: 'Stop hang' }));

        expect(storageContext.updateDeadHang).not.toHaveBeenCalled();
        expect(
          screen.getByRole('button', { name: 'Start hang' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('the session', () => {
    describe('when there are hangs from today', () => {
      it('shows the total and the best hang', () => {
        renderWithHealthStorage(<DeadHangCard />, {
          deadHang: { date: getToday(), hangs: [12, 9, 14] },
        });

        expect(
          screen.getByRole('img', {
            name: '35 of 60 seconds today, best hang 14 of 30 seconds',
          }),
        ).toBeInTheDocument();
      });

      it('adds a new hang to them', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const { storageContext } = renderWithHealthStorage(<DeadHangCard />, {
          deadHang: { date: getToday(), hangs: [12, 9] },
        });

        await user.click(screen.getByRole('button', { name: 'Start hang' }));
        act(() => {
          jest.advanceTimersByTime(10_000);
        });
        await user.click(screen.getByRole('button', { name: 'Stop hang' }));

        expect(storageContext.updateDeadHang).toHaveBeenCalledWith({
          date: getToday(),
          hangs: [12, 9, 8],
          bestHang: 12,
        });
      });
    });

    describe('when the last hangs were on an earlier day', () => {
      it('starts a new session', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const { storageContext } = renderWithHealthStorage(<DeadHangCard />, {
          deadHang: { date: getDateDaysAgo(1), hangs: [12, 9] },
        });

        expect(
          screen.getByRole('img', {
            name: '0 of 60 seconds today, best hang 12 of 30 seconds',
          }),
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Start hang' }));
        act(() => {
          jest.advanceTimersByTime(7000);
        });
        await user.click(screen.getByRole('button', { name: 'Stop hang' }));

        expect(storageContext.updateDeadHang).toHaveBeenCalledWith({
          date: getToday(),
          hangs: [5],
          bestHang: 12,
        });
      });
    });

    describe('when an earlier day had a longer hang than today', () => {
      const deadHang = { date: getToday(), hangs: [12, 9], bestHang: 25 };

      it('shows the earlier hang as the best', () => {
        renderWithHealthStorage(<DeadHangCard />, { deadHang });

        expect(
          screen.getByRole('img', {
            name: '21 of 60 seconds today, best hang 25 of 30 seconds',
          }),
        ).toBeInTheDocument();
      });

      describe('and a new hang beats it', () => {
        it('records the new hang as the best', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          const { storageContext } = renderWithHealthStorage(<DeadHangCard />, {
            deadHang,
          });

          await user.click(screen.getByRole('button', { name: 'Start hang' }));
          act(() => {
            jest.advanceTimersByTime(30_000);
          });
          await user.click(screen.getByRole('button', { name: 'Stop hang' }));

          expect(storageContext.updateDeadHang).toHaveBeenCalledWith({
            date: getToday(),
            hangs: [12, 9, 28],
            bestHang: 28,
          });
        });
      });
    });
  });

  describe('hovering the rings', () => {
    const deadHang = { date: getToday(), hangs: [12, 9], bestHang: 25 };

    it('shows the total for today on the outer ring', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithHealthStorage(<DeadHangCard />, { deadHang });

      await user.hover(screen.getByTestId('session-ring'));

      expect(screen.getByRole('tooltip')).toHaveTextContent('Today: 21/60');
    });

    it('shows the best hang on the inner ring', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithHealthStorage(<DeadHangCard />, { deadHang });

      await user.hover(screen.getByTestId('best-hang-ring'));

      expect(screen.getByRole('tooltip')).toHaveTextContent('Best: 25/30');
    });

    it('hides the tooltip when the pointer moves away', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithHealthStorage(<DeadHangCard />, { deadHang });
      const ring = screen.getByTestId('session-ring');
      await user.hover(ring);
      const tooltip = screen.getByRole('tooltip');

      await user.unhover(ring);

      expect(tooltip).not.toBeInTheDocument();
    });
  });
});
