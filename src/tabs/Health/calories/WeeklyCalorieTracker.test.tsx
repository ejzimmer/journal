import { render, screen } from '@testing-library/react';
import { WeeklyCalorieTracker } from './WeeklyCalorieTracker';
import { Balance } from '../utils';

const firstDay = Temporal.PlainDate.from('2026-01-01');
const mockDays: Balance[] = Array.from({ length: 18 }).map((_, index) => {
  const thisDay = firstDay.add({ days: index });
  return {
    id: thisDay.toString(),
    day: thisDay.day,
    month: 'Jan',
    monthNumber: thisDay.month,
    year: thisDay.year,
    dayOfWeek: thisDay.dayOfWeek,
    balance: 20000,
  };
});

describe('WeeklyCalorieTracker', () => {
  it("doesn't show a duplicate bar when today completes a week", () => {
    render(<WeeklyCalorieTracker days={mockDays.slice(0, 7)} />);

    const bars = screen.getAllByText(/^\d+ Jan: /);
    expect(bars).toHaveLength(1);
  });

  it('shows a bar for every week, including the current, incomplete week', () => {
    render(<WeeklyCalorieTracker days={mockDays} />);

    const bars = screen.getAllByText(/^\d+ Jan: /);
    expect(bars).toHaveLength(3);
  });

  describe('bar colours', () => {
    const renderWeeks = (balances: number[]) => {
      const days = mockDays.map((day, index) => ({
        ...day,
        balance: balances[Math.floor(index / 7)],
      }));
      render(<WeeklyCalorieTracker days={days} />);
      return balances.map((balance, index) =>
        screen.getByRole('img', {
          name: `${Math.min(index * 7 + 7, 18)} Jan: ${balance.toLocaleString()}`,
        }),
      );
    };

    describe('when a week is over 20,000', () => {
      it('shows it as orange', () => {
        const [over] = renderWeeks([20001, 15000, 19000]);
        expect(over).toHaveClass('week-over');
      });
    });

    describe('when a week is within 1,000 of the lowest week', () => {
      it('shows it as the darkest green', () => {
        const [lowest, nearLowest] = renderWeeks([15000, 15999, 19000]);
        expect(lowest).toHaveClass('week-lowest');
        expect(nearLowest).toHaveClass('week-lowest');
      });
    });

    describe('when a week is between 19,000 and 20,000', () => {
      it('shows it as the regular green', () => {
        const [bottom, top] = renderWeeks([19000, 20000, 15000]);
        [bottom, top].forEach((week) => {
          expect(week).toHaveClass('week hovertext-anchor', { exact: true });
        });
      });
    });

    describe('when a week is between the lowest week and 19,000', () => {
      it('shades it between the darkest and regular greens', () => {
        const [, between] = renderWeeks([15000, 17000, 19000]);
        expect(between).toHaveClass('week-between');
        expect(between).toHaveStyle({ '--lowest-share': '50%' });
      });

      it('gives weeks in the same thousand the same shade', () => {
        const [, first, second] = renderWeeks([15000, 17453, 17999]);
        expect(first).toHaveStyle({ '--lowest-share': '50%' });
        expect(second).toHaveStyle({ '--lowest-share': '50%' });
      });

      it('gives weeks in different thousands different shades', () => {
        const [, first, second] = renderWeeks([15000, 17999, 18076]);
        expect(first).toHaveStyle({ '--lowest-share': '50%' });
        expect(second).toHaveStyle({ '--lowest-share': '25%' });
      });
    });
  });

  describe('when the bars are wider than the screen', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('scrolls to the latest week', () => {
      jest
        .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
        .mockReturnValue(1200);
      const setScrollLeft = jest.spyOn(
        HTMLElement.prototype,
        'scrollLeft',
        'set',
      );

      render(<WeeklyCalorieTracker days={mockDays} />);

      expect(setScrollLeft).toHaveBeenCalledWith(1200);
    });
  });
});
