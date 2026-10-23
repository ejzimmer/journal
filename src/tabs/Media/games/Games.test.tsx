import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageContextWrapper } from '../../../shared/storageContextTestUtils';
import { seedData } from '../../../mocks/seedData';
import { MediaStorageContext } from '../MediaStorageContext';
import { createMediaStorageContext } from '../mediaStorageTestUtils';
import { WIND_WAKER_PATH } from '../windWaker/windWakerPath';
import { Games } from './Games';

function renderGames() {
  const storage = {
    useValue: <T,>(key?: string) => ({
      value: (key === WIND_WAKER_PATH
        ? seedData.media.wind_waker
        : undefined) as T,
      loading: false,
      synced: true,
    }),
  };
  const mediaStorage = createMediaStorageContext({
    games: [{ id: 'game-hades', type: 'game', title: 'Hades' }],
  });

  render(
    <StorageContextWrapper value={storage}>
      <MediaStorageContext.Provider value={mediaStorage}>
        <Games />
      </MediaStorageContext.Provider>
    </StorageContextWrapper>,
  );
}

describe('Games', () => {
  describe('with Wind Waker goals', () => {
    it('shows a Wind Waker tab after the year tabs', () => {
      renderGames();

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2026',
        'Wind Waker',
      ]);
    });

    it('shows the shelves for this year', () => {
      renderGames();

      expect(screen.getByRole('tabpanel', { name: '2026' })).toHaveTextContent(
        'Hades',
      );
    });

    describe('selecting the Wind Waker tab', () => {
      it('shows the Wind Waker goals in place of the shelves', async () => {
        renderGames();
        const game = screen.getByText('Hades');

        await userEvent.click(screen.getByRole('tab', { name: 'Wind Waker' }));

        expect(game).not.toBeInTheDocument();
        expect(
          screen.getByRole('tabpanel', { name: 'Wind Waker' }),
        ).toContainElement(
          screen.getByRole('button', { name: 'Sea chart A1' }),
        );
      });

      it('hides the add game button', async () => {
        renderGames();
        const addButton = screen.getByRole('button', { name: 'Add a game' });

        await userEvent.click(screen.getByRole('tab', { name: 'Wind Waker' }));

        expect(addButton).not.toBeInTheDocument();
      });

      describe('then selecting a year', () => {
        it('shows the shelves again', async () => {
          renderGames();

          await userEvent.click(
            screen.getByRole('tab', { name: 'Wind Waker' }),
          );
          await userEvent.click(screen.getByRole('tab', { name: '2026' }));

          expect(
            screen.getByRole('tabpanel', { name: '2026' }),
          ).toHaveTextContent('Hades');
        });
      });
    });
  });
});
