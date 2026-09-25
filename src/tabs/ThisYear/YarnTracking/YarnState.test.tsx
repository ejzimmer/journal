import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YarnState } from './YarnState';
import { renderWithYarnStorage } from './yarnStorageTestUtils';

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
      renderWithYarnStorage(<YarnState />, { pile: [], currentBalance: 1000 });

      expect(screen.getByText('Current: 1,000g')).toBeInTheDocument();
    });
  });

  describe('the pile of yarn', () => {
    describe('a ball in the stash', () => {
      it('is labelled with its yarn type and weight', () => {
        renderWithYarnStorage(<YarnState />, {
          pile: [
            { id: 0, yarnType: 'wool', grams: 200 },
            { id: 1, yarnType: 'wool', grams: 100 },
          ],
        });

        expect(
          screen.getByRole('listitem', { name: 'wool: 200g' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('listitem', { name: 'wool: 100g' }),
        ).toBeInTheDocument();
      });

      it('is described by the balance of its whole yarn type', () => {
        renderWithYarnStorage(<YarnState />, {
          pile: [
            { id: 0, yarnType: 'wool', grams: 200 },
            { id: 1, yarnType: 'wool', grams: 100 },
          ],
          getBalance: (yarnType) => (yarnType === 'wool' ? 3191 : 0),
        });

        expect(
          screen.getByRole('listitem', { name: 'wool: 200g' }),
        ).toHaveAccessibleDescription('wool: 3,191g');
        expect(
          screen.getByRole('listitem', { name: 'wool: 100g' }),
        ).toHaveAccessibleDescription('wool: 3,191g');
      });
    });

    describe('when the pointer is over a ball', () => {
      it('shows the details of that ball', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        renderWithYarnStorage(<YarnState />, {
          pile: [
            { id: 0, yarnType: 'wool', grams: 200 },
            { id: 1, yarnType: 'cotton', grams: 200 },
          ],
          getBalance: (yarnType) => (yarnType === 'cotton' ? 950 : 0),
        });

        await user.pointer({
          target: screen.getByRole('img', { name: 'Pile of yarn' }),
          coords: { clientX: 82, clientY: 32 },
        });

        expect(screen.getByRole('tooltip')).toHaveTextContent('cotton: 950g');
      });

      describe('and then leaves the pile', () => {
        it('hides the details', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          renderWithYarnStorage(<YarnState />, {
            pile: [{ id: 0, yarnType: 'wool', grams: 200 }],
          });
          await user.pointer({
            target: screen.getByRole('img', { name: 'Pile of yarn' }),
            coords: { clientX: 58, clientY: 32 },
          });
          const tooltip = screen.getByRole('tooltip');

          await user.unhover(screen.getByRole('img', { name: 'Pile of yarn' }));

          expect(tooltip).not.toBeInTheDocument();
        });
      });
    });

    describe('a ball that has been used', () => {
      it('is described by its size and the month it was used', () => {
        renderWithYarnStorage(<YarnState />, {
          pile: [
            {
              id: 0,
              yarnType: 'cotton',
              grams: 200,
              usedIn: Temporal.PlainYearMonth.from('2026-06'),
            },
          ],
        });

        expect(
          screen.getByRole('listitem', { name: 'used cotton: 200g' }),
        ).toHaveAccessibleDescription('cotton: 200g, used Jun 2026');
      });

      describe('when it was used a year or more ago', () => {
        it('leaves only the balls used more recently', () => {
          renderWithYarnStorage(<YarnState />, {
            pile: [
              {
                id: 0,
                yarnType: 'wool',
                grams: 200,
                usedIn: Temporal.PlainYearMonth.from('2025-09'),
              },
              {
                id: 1,
                yarnType: 'wool',
                grams: 200,
                usedIn: Temporal.PlainYearMonth.from('2025-10'),
              },
            ],
          });

          expect(screen.getAllByRole('listitem')).toEqual([
            screen.getByRole('listitem', { name: 'used wool: 200g' }),
          ]);
        });
      });
    });
  });
});
