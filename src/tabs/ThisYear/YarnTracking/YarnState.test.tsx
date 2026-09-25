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
    .map((ball) => ball.style.width);

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

    it('draws every full ball at the size a full ball gets', () => {
      renderYarnState();

      const wool = getBallWidths(getMonths().february, 'wool: 750g');
      const cotton = getBallWidths(getMonths().january, 'cotton: 250g');

      expect([...wool.slice(0, 7), ...cotton.slice(0, 2)]).toEqual(
        Array(9).fill('calc(var(--ball-size) * 1)'),
      );
    });

    it('sizes a full ball so the biggest month fills the width available', () => {
      renderYarnState();

      expect(screen.getByRole('list')).toHaveAttribute(
        'style',
        '--balls-across: 10;',
      );
    });

    describe("when the grams don't fill a whole number of balls", () => {
      it('draws the leftover grams as a proportionally smaller ball', () => {
        renderYarnState();

        const [, , remainderBall] = getBallWidths(
          getMonths().january,
          'cotton: 250g',
        );

        expect(remainderBall).toBe('calc(var(--ball-size) * 0.5)');
      });
    });
  });
});
