import { screen } from '@testing-library/react';
import { YarnState } from './YarnState';
import { renderWithYarnStorage } from './yarnStorageTestUtils';
import { convertToYarnType } from './YarnStorageContext';
import { StoredYarn } from './types';
import { buildYarnPile } from './utils';

const renderYarnState = (storedYarn: StoredYarn, currentBalance = 0) =>
  renderWithYarnStorage(<YarnState />, {
    pile: buildYarnPile(Object.values(storedYarn).map(convertToYarnType)),
    currentBalance,
  });

describe('YarnState', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-11'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('the current total', () => {
    it('shows the grams currently in the stash', () => {
      renderYarnState({}, 1000);

      expect(screen.getByText('Current: 1,000g')).toBeInTheDocument();
    });
  });

  describe('the pile of yarn', () => {
    describe('a ball in the stash', () => {
      it('is labelled with its yarn type and weight', () => {
        renderYarnState({ wool: { id: 'wool', history: { '2026-01': 300 } } });

        expect(
          screen.getByRole('img', { name: 'wool: 200g' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('img', { name: 'wool: 100g' }),
        ).toBeInTheDocument();
      });

      it('is sized by how much of a full ball it holds', () => {
        renderYarnState({ wool: { id: 'wool', history: { '2026-01': 100 } } });

        expect(
          screen.getByRole('img', { name: 'wool: 100g' }).style.width,
        ).toBe('calc(var(--ball-size) * 0.5)');
      });
    });

    describe('a ball that has been used', () => {
      describe('when it was used less than a year ago', () => {
        it('fades in proportion to how long ago it was used', () => {
          renderYarnState({
            wool: { id: 'wool', history: { '2026-03': 200, '2026-06': 0 } },
          });

          expect(
            screen
              .getByRole('img', { name: 'used wool: 200g' })
              .style.getPropertyValue('--fade'),
          ).toBe('0.25');
        });
      });

      describe('when it was used a year or more ago', () => {
        it('leaves only the balls used more recently', () => {
          renderYarnState({
            wool: {
              id: 'wool',
              history: { '2025-08': 400, '2025-09': 200, '2025-10': 0 },
            },
          });

          expect(screen.getAllByRole('img')).toEqual([
            screen.getByRole('img', { name: 'used wool: 200g' }),
          ]);
        });
      });
    });
  });
});
