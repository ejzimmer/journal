import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { Noticeboard } from './Noticeboard';
import { Adventure } from './types';

const createAdventure = (
  id: string,
  extra: Partial<Adventure> = {},
): Adventure => ({
  id,
  description: id,
  modeId: 'running',
  isDone: false,
  ...extra,
});

const renderNoticeboard = (adventures: Adventure[]) =>
  render(
    <AdventureStorageContext.Provider
      value={{
        adventures,
        modes: [],
        isLoading: false,
        addAdventure: jest.fn(),
        updateAdventure: jest.fn(),
        deleteAdventure: jest.fn(),
        addMode: jest.fn(),
      }}
    >
      <Noticeboard />
    </AdventureStorageContext.Provider>,
  );

describe('Noticeboard', () => {
  describe('when there are adventures', () => {
    it('pins up every one in the order they were added', () => {
      const storage: AdventureStorageContextType = {
        adventures: [
          {
            id: 'parkrun',
            description: 'Plenty Gorge parkrun',
            modeId: 'running',
            isDone: false,
          },
          {
            id: 'yarra',
            description: 'Paddle the Yarra',
            modeId: 'kayaking',
            isDone: false,
            plannedDate: '2026-11-01',
          },
          {
            id: 'hurstbridge',
            description: 'Ride to Hurstbridge',
            modeId: 'cycling',
            isDone: true,
          },
        ],
        modes: [],
        isLoading: false,
        addAdventure: jest.fn(),
        updateAdventure: jest.fn(),
        deleteAdventure: jest.fn(),
        addMode: jest.fn(),
      };

      render(
        <AdventureStorageContext.Provider value={storage}>
          <Noticeboard />
        </AdventureStorageContext.Provider>,
      );

      expect(
        screen.getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual([
        'Plenty Gorge parkrun',
        'Paddle the YarraSun 1 Nov',
        'Ride to Hurstbridge',
      ]);
    });
  });

  describe('when adventures were done in earlier years', () => {
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2027-02-10'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const adventures = [
      createAdventure('parkrun'),
      createAdventure('yarra', { isDone: true, completedAt: '2027-01-26' }),
      createAdventure('hurstbridge', { isDone: true }),
    ];

    it('has a tab for this year and each year an adventure was done', () => {
      renderNoticeboard(adventures);

      expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
        '2027',
        '2026',
      ]);
    });

    describe('and this year is selected', () => {
      it('pins up the adventures still to do and the ones done this year', () => {
        renderNoticeboard(adventures);

        expect(
          screen.getAllByRole('listitem').map((item) => item.textContent),
        ).toEqual(['parkrun', 'yarra']);
      });
    });

    describe('and an earlier year is selected', () => {
      it('pins up only the adventures done that year', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        renderNoticeboard(adventures);
        const addAdventure = screen.getByRole('button', {
          name: 'Add an adventure',
        });

        await user.click(screen.getByRole('tab', { name: '2026' }));

        expect(
          screen.getAllByRole('listitem').map((item) => item.textContent),
        ).toEqual(['hurstbridge']);
        expect(addAdventure).not.toBeInTheDocument();
      });
    });
  });
});
