import { render, screen } from '@testing-library/react';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { Noticeboard } from './Noticeboard';

describe('Noticeboard', () => {
  describe('when there are adventures', () => {
    it('lists every one', () => {
      const storage: AdventureStorageContextType = {
        adventures: [
          {
            id: 'parkrun',
            description: 'Plenty Gorge parkrun',
            modeId: 'running',
            isDone: false,
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
      ).toEqual(['Plenty Gorge parkrun', 'Ride to Hurstbridge']);
    });
  });
});
