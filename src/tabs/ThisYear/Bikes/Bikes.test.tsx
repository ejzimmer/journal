import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from '../../../shared/FirebaseContext';
import { createMockFirebaseContext } from '../../../shared/mockFirebase';
import { Bikes } from '.';

const diverge = { name: 'Diverge', icon: '🚲', isDone: true };
const uterus = { name: 'Uterus', icon: '📦', isDone: false };

const renderBikes = (seed: Record<string, unknown>) => {
  jest.useFakeTimers({ advanceTimers: true });
  jest.setSystemTime(new Date(2027, 1, 10));
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(
    <FirebaseContext.Provider value={createMockFirebaseContext(seed)}>
      <Bikes />
    </FirebaseContext.Provider>,
  );
  return { user };
};

describe('Bikes', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when this year has bikes', () => {
    const seed = { bikes: { '2027': [diverge, uterus] } };

    it('shows which of them have been ridden', () => {
      renderBikes(seed);

      expect(screen.getByRole('checkbox', { name: 'Diverge' })).toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: 'Uterus' }),
      ).not.toBeChecked();
    });

    describe('and a bike is ticked', () => {
      it('saves it as ridden', async () => {
        const { user } = renderBikes(seed);

        await user.click(screen.getByRole('checkbox', { name: 'Uterus' }));

        expect(screen.getByRole('checkbox', { name: 'Uterus' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Diverge' })).toBeChecked();
      });
    });
  });

  describe('when only an earlier year has bikes', () => {
    const seed = { bikes: { '2026': [diverge, uterus] } };

    it('starts this year with the same bikes, none of them ridden', () => {
      renderBikes(seed);

      expect(
        screen.getByRole('checkbox', { name: 'Diverge' }),
      ).not.toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: 'Uterus' }),
      ).not.toBeChecked();
    });

    describe('and a bike is ticked', () => {
      it('rides only that bike this year', async () => {
        const { user } = renderBikes(seed);

        await user.click(screen.getByRole('checkbox', { name: 'Uterus' }));

        expect(screen.getByRole('checkbox', { name: 'Uterus' })).toBeChecked();
        expect(
          screen.getByRole('checkbox', { name: 'Diverge' }),
        ).not.toBeChecked();
      });
    });
  });

  describe('when an earlier year has bikes', () => {
    const seed = {
      bikes: {
        '2026': [diverge, uterus],
        '2027': [{ ...diverge, isDone: false }, uterus],
      },
    };

    it('shows a tab for each year, newest first, with this year selected', () => {
      renderBikes(seed);

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2027',
        '2026',
      ]);
      expect(screen.getByRole('tab', { name: '2027' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    describe('and that year is selected', () => {
      it('shows the bikes ridden that year', async () => {
        const { user } = renderBikes(seed);

        await user.click(screen.getByRole('tab', { name: '2026' }));

        expect(screen.getByRole('checkbox', { name: 'Diverge' })).toBeChecked();
      });

      describe('and a bike is ticked', () => {
        it('rides it in that year only', async () => {
          const { user } = renderBikes(seed);
          await user.click(screen.getByRole('tab', { name: '2026' }));

          await user.click(screen.getByRole('checkbox', { name: 'Uterus' }));
          expect(
            screen.getByRole('checkbox', { name: 'Uterus' }),
          ).toBeChecked();

          await user.click(screen.getByRole('tab', { name: '2027' }));
          expect(
            screen.getByRole('checkbox', { name: 'Uterus' }),
          ).not.toBeChecked();
        });
      });
    });
  });
});
