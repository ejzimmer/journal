import { screen, within } from '@testing-library/react';
import { YarnState } from './YarnState';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';

const yarnState = {
  wool: {
    id: 'wool',
    history: {
      '26-01': 250,
      '26-02': 750,
    },
  },
  cotton: {
    id: 'cotton',
    history: {
      '26-01': 250,
    },
  },
};

const renderYarnState = () =>
  renderWithStorage(<YarnState />, {
    value: { useValue: jest.fn().mockReturnValue({ value: yarnState }) },
  });

const getMonths = () => {
  const [january, february, current] = screen.getAllByRole('listitem');
  return { january, february, current };
};

const getBallWidths = (month: HTMLElement, yarnType: string) =>
  within(within(month).getByRole('img', { name: yarnType }))
    .getAllByTestId('yarn-ball')
    .map((ball) => Number.parseFloat(ball.style.width));

describe('YarnState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-11'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('the monthly totals', () => {
    it('shows the total for each month, carrying the current month forward', () => {
      renderYarnState();

      expect(screen.getByText(/January: 500g/)).toBeInTheDocument();
      expect(screen.getByText(/February: 1,000g/)).toBeInTheDocument();
      expect(screen.getByText(/Current: 1,000g/)).toBeInTheDocument();
    });

    it('sets the row widths as percentages of the highest amount', () => {
      renderYarnState();

      const { january, february, current } = getMonths();

      expect(january).toHaveAttribute('style', 'width: 50%;');
      expect(february).toHaveAttribute('style', 'width: 100%;');
      expect(current).toHaveAttribute('style', 'width: 100%;');
    });
  });

  describe('the balls of yarn', () => {
    it('labels each yarn type with what the month holds of it', () => {
      renderYarnState();

      expect(
        within(getMonths().february).getByRole('img', { name: 'wool: 750g' }),
      ).toBeInTheDocument();
    });

    it('draws a ball for each 100g of a yarn type', () => {
      renderYarnState();

      expect(getBallWidths(getMonths().february, 'wool: 750g')).toHaveLength(8);
    });

    describe("when the grams don't fill a whole number of balls", () => {
      it('draws the leftover grams as a proportionally smaller ball', () => {
        renderYarnState();

        const [fullBall, , remainderBall] = getBallWidths(
          getMonths().january,
          'cotton: 250g',
        );

        expect(remainderBall).toBeCloseTo(fullBall / 2);
      });
    });
  });
});
