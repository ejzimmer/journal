import { render, screen } from '@testing-library/react';
import { AdventureCard } from './AdventureCard';
import { Adventure, AdventureMode } from './types';

const running: AdventureMode = {
  id: 'running',
  name: 'Running',
  emoji: '🏃',
  colour: '#d11c2e',
};

const renderCard = (details: Partial<Adventure> = {}) =>
  render(
    <ul>
      <AdventureCard
        adventure={{
          id: 'parkrun',
          description: 'Plenty Gorge parkrun',
          modeId: 'running',
          isDone: false,
          ...details,
        }}
        mode={running}
      />
    </ul>,
  );

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

  describe('when it is done', () => {
    it('shows the done stamp', () => {
      renderCard({ isDone: true });

      expect(screen.getByRole('img', { name: 'Done' })).toBeInTheDocument();
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
