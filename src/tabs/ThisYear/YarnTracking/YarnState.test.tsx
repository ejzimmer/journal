import { screen, within } from '@testing-library/react';
import { YarnState } from './YarnState';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';

const yarnState = {
  wool: {
    id: 'wool',
    history: {
      '2026-01': 300,
      '2026-02': 700,
    },
  },
  cotton: {
    id: 'cotton',
    history: {
      '2026-01': 300,
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

      expect(screen.getByText(/January: 600g/)).toBeInTheDocument();
      expect(screen.getByText(/February: 1,000g/)).toBeInTheDocument();
      expect(screen.getByText(/Current: 1,000g/)).toBeInTheDocument();
    });
  });

  describe('the balls of yarn', () => {
    it('labels each yarn type with what the month holds of it', () => {
      renderYarnState();

      expect(
        within(getMonths().february).getByRole('img', { name: 'wool: 700g' }),
      ).toBeInTheDocument();
    });

    it('draws a ball for each 200g of a yarn type', () => {
      renderYarnState();

      expect(getBallWidths(getMonths().february, 'wool: 700g')).toHaveLength(4);
    });

    it('draws every full ball at the size a full ball gets', () => {
      renderYarnState();

      const wool = getBallWidths(getMonths().february, 'wool: 700g');
      const cotton = getBallWidths(getMonths().january, 'cotton: 300g');

      expect([...wool.slice(0, 3), ...cotton.slice(0, 1)]).toEqual(
        Array(4).fill('calc(var(--ball-size) * 1)'),
      );
    });

    it('sizes a full ball so the biggest month fills the width available', () => {
      renderYarnState();

      expect(screen.getByRole('list')).toHaveAttribute(
        'style',
        '--balls-across: 5;',
      );
    });

    describe("when the grams don't fill a whole number of balls", () => {
      it('draws the leftover grams as a proportionally smaller ball', () => {
        renderYarnState();

        const [, remainderBall] = getBallWidths(
          getMonths().january,
          'cotton: 300g',
        );

        expect(remainderBall).toBe('calc(var(--ball-size) * 0.5)');
      });
    });
  });
});
