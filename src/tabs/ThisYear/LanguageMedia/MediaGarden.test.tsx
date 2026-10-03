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
  it('grows a tree for each book and manga series', () => {
    renderWithLanguageMediaStorage(<MediaGarden />, {
      media: [lupin, yotsuba, hugo, lesMiserables],
    });

    expect(
      screen.getAllByRole('img').map((tree) => tree.getAttribute('aria-label')),
    ).toEqual(['よつばと！', 'Les Misérables']);
  });
});
