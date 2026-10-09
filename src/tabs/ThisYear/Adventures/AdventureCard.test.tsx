import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdventureCard } from './AdventureCard';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { Adventure, AdventureMode } from './types';

const running: AdventureMode = {
  id: 'running',
  name: 'Running',
  emoji: '🏃',
  colour: '#d11c2e',
};

const renderCard = (details: Partial<Adventure> = {}) => {
  const adventure: Adventure = {
    id: 'parkrun',
    description: 'Plenty Gorge parkrun',
    modeId: 'running',
    isDone: false,
    ...details,
  };
  const storage: AdventureStorageContextType = {
    adventures: [adventure],
    modes: [running],
    isLoading: false,
    addAdventure: jest.fn(),
    updateAdventure: jest.fn(),
    deleteAdventure: jest.fn(),
    addMode: jest.fn(),
  };
  render(
    <AdventureStorageContext.Provider value={storage}>
      <ul>
        <AdventureCard adventure={adventure} mode={running} />
      </ul>
    </AdventureStorageContext.Provider>,
  );
  return {
    adventure,
    storage,
    user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }),
  };
};

describe('AdventureCard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 2, 10, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the description with its mode', () => {
    renderCard();

    expect(screen.getByRole('listitem')).toHaveTextContent(
      '🏃Plenty Gorge parkrun',
    );
    expect(screen.getByRole('img', { name: 'Running' })).toBeInTheDocument();
  });

  describe('when it is marked done', () => {
    it('saves it as done', async () => {
      const { adventure, storage, user } = renderCard();

      await user.click(screen.getByRole('button', { name: 'Mark done' }));

      expect(storage.updateAdventure).toHaveBeenCalledWith({
        ...adventure,
        isDone: true,
      });
    });
  });

  describe('when it is done', () => {
    it('shows the done stamp', () => {
      renderCard({ isDone: true });

      expect(screen.getByRole('img', { name: 'Done' })).toBeInTheDocument();
    });

    describe('and is marked not done', () => {
      it('saves it as not done', async () => {
        const { adventure, storage, user } = renderCard({ isDone: true });

        await user.click(screen.getByRole('button', { name: 'Mark not done' }));

        expect(storage.updateAdventure).toHaveBeenCalledWith({
          ...adventure,
          isDone: false,
        });
      });
    });
  });

  describe('when a delete is confirmed', () => {
    it('deletes the adventure', async () => {
      const { adventure, storage, user } = renderCard();

      await user.click(screen.getByRole('button', { name: 'Delete' }));
      await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

      expect(storage.deleteAdventure).toHaveBeenCalledWith(adventure);
    });
  });

  describe('when it has a planned date', () => {
    it('shows the date', () => {
      renderCard({ plannedDate: '2026-10-17' });

      expect(screen.getByText('Sat 17 Oct')).toBeInTheDocument();
    });

    describe('within a week', () => {
      it('marks it very soon', () => {
        renderCard({ plannedDate: '2026-10-09' });

        expect(screen.getByText('Fri 9 Oct')).toHaveClass('very-soon');
      });
    });

    describe('within three weeks', () => {
      it('marks it soon', () => {
        renderCard({ plannedDate: '2026-10-23' });

        expect(screen.getByText('Fri 23 Oct')).toHaveClass('soon');
      });
    });

    describe('more than three weeks away', () => {
      it('leaves it plain', () => {
        renderCard({ plannedDate: '2026-10-24' });

        expect(screen.getByText('Sat 24 Oct')).toHaveClass('planned-date', {
          exact: true,
        });
      });
    });

    describe('and is done', () => {
      it('leaves the date plain', () => {
        renderCard({ plannedDate: '2026-10-09', isDone: true });

        expect(screen.getByText('Fri 9 Oct')).toHaveClass('planned-date', {
          exact: true,
        });
      });
    });
  });
});
