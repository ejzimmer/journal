import { render, screen } from '@testing-library/react';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { Noticeboard } from './Noticeboard';

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
        'Ride to Hurstbridge',
        'Paddle the YarraSun 1 Nov',
      ]);
    });
  });
});
