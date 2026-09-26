import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from '../../../shared/FirebaseContext';
import { createMockFirebaseContext } from '../../../shared/mockFirebase';
import { YarnTracking } from '.';
import { StoredYarn } from './types';

const createYarn = (month: string, grams: number): StoredYarn => ({
  wool: { id: 'wool', history: { [month]: grams } },
});

const renderYarnTracking = (seed: Record<string, unknown>) => {
  jest.useFakeTimers({ advanceTimers: true });
  jest.setSystemTime(new Date(2028, 1, 10));
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(
    <FirebaseContext.Provider value={createMockFirebaseContext(seed)}>
      <YarnTracking />
    </FirebaseContext.Provider>,
  );
  return { user };
};

describe('YarnTracking', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when only this year has yarn', () => {
    it('shows this year without any tabs', () => {
      renderYarnTracking({ '2028': { yarn: createYarn('2028-01', 400) } });

      expect(screen.getByText('400g')).toBeInTheDocument();
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('when earlier years have yarn', () => {
    const seed = {
      '2026': { yarn: createYarn('2026-05', 1000) },
      '2027': { yarn: createYarn('2027-05', 600) },
      '2028': { yarn: createYarn('2028-01', 200) },
    };

    it('lists the years newest first, starting with this year', () => {
      renderYarnTracking(seed);

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2028',
        '2027',
        '2026',
      ]);
      expect(screen.getByRole('tab', { name: '2028' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('shows the selected year in the tab panel', async () => {
      const { user } = renderYarnTracking(seed);

      await user.click(screen.getByRole('tab', { name: '2026' }));

      expect(screen.getByRole('tabpanel', { name: '2026' })).toHaveTextContent(
        '1,000g',
      );
    });

    it('moves between years with the arrow keys', async () => {
      const { user } = renderYarnTracking(seed);

      await user.click(screen.getByRole('tab', { name: '2028' }));
      await user.keyboard('{ArrowRight}');

      const tab = screen.getByRole('tab', { name: '2027' });
      expect(tab).toHaveAttribute('aria-selected', 'true');
      expect(tab).toHaveFocus();
    });

    describe('and an earlier year is selected', () => {
      it('hides the add yarn form', async () => {
        const { user } = renderYarnTracking(seed);
        const addYarn = screen.getByRole('button', { name: 'Update yarn' });

        await user.click(screen.getByRole('tab', { name: '2027' }));

        expect(addYarn).not.toBeInTheDocument();
      });
    });
  });

  describe('when this year has no yarn yet but last year does', () => {
    it('still shows a tab for this year', () => {
      renderYarnTracking({ '2027': { yarn: createYarn('2027-05', 600) } });

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2028',
        '2027',
      ]);
    });
  });
});
