import { screen } from '@testing-library/react';
import { MediaGarden } from './MediaGarden';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { hugo, lupin, yotsuba } from './testMedia';
import { PrintSeries } from './types';

const lesMiserables: PrintSeries = {
  id: 'lesmis',
  type: 'book',
  name: 'Les Misérables',
  language: 'french',
};

describe('MediaGarden', () => {
  describe('when there are books and manga', () => {
    it('grows a tree for each series', () => {
      renderWithLanguageMediaStorage(<MediaGarden />, {
        media: [yotsuba, lesMiserables],
      });

      expect(
        screen
          .getAllByRole('img')
          .map((tree) => tree.getAttribute('aria-label')),
      ).toEqual(['よつばと！', 'Les Misérables']);
    });
  });

  describe('when there are tv series and youtube channels', () => {
    it('grows only the trees', () => {
      renderWithLanguageMediaStorage(<MediaGarden />, {
        media: [lupin, yotsuba, hugo],
      });

      expect(screen.getAllByRole('img')).toEqual([
        screen.getByRole('img', { name: 'よつばと！' }),
      ]);
    });
  });
});
