import { screen } from '@testing-library/react';
import { MediaList } from './MediaList';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { LanguageMedia } from './types';

const renderList = (media: LanguageMedia[]) =>
  renderWithLanguageMediaStorage(<MediaList />, { media });

const lupin: LanguageMedia = {
  id: 'lupin',
  type: 'tv',
  name: 'Lupin',
  language: 'french',
  seasons: [
    {
      number: 1,
      episodes: [
        {
          number: 1,
          name: 'Chapitre 1',
          lengthInSeconds: 2826,
          lookups: 12,
          aiQuestions: 2,
          understood: 70,
        },
        {
          number: 2,
          lookups: 4,
          aiQuestions: 0,
          status: 'in-progress',
        },
      ],
    },
  ],
  upTo: { season: 1, episode: 2, timestampInSeconds: 754 },
};

const hugo: LanguageMedia = {
  id: 'hugo',
  type: 'youtube',
  name: 'HugoDécrypte',
  language: 'french',
  videos: [
    {
      url: 'https://youtu.be/1',
      lengthInSeconds: 3725,
      upToInSeconds: 1200,
      lookups: 7,
      aiQuestions: 1,
    },
    {
      url: 'https://youtu.be/2',
      lookups: 0,
      aiQuestions: 0,
      status: 'done',
    },
  ],
};

const yotsuba: LanguageMedia = {
  id: 'yotsuba',
  type: 'manga',
  name: 'よつばと！',
  language: 'japanese',
  volumes: [
    {
      number: 1,
      pages: 220,
      chapters: [
        {
          number: 1,
          lastPage: 38,
          lookups: 20,
          aiQuestions: 3,
          understood: 60,
        },
        {
          number: 2,
          name: 'よつばとアイス',
          lookups: 0,
          aiQuestions: 0,
        },
      ],
    },
  ],
  upTo: { volume: 1, chapter: 2, page: 41 },
};

describe('MediaList', () => {
  describe('a tv series', () => {
    it('shows its name, language and type', () => {
      renderList([lupin]);

      expect(screen.getByText('Lupin, French TV series')).toBeInTheDocument();
    });

    it('shows where I am up to', () => {
      renderList([lupin]);

      expect(screen.getByText('Up to 1-2-12:34')).toBeInTheDocument();
    });

    it('lists its seasons', () => {
      renderList([lupin]);

      expect(screen.getByText('Season 1')).toBeInTheDocument();
    });

    describe('an episode', () => {
      it('shows its name, length and comprehension', () => {
        renderList([lupin]);

        expect(
          screen.getByText(
            'Chapitre 1 (47:06): 12 looked up, 2 asked AI, 70% understood',
          ),
        ).toBeInTheDocument();
      });

      describe('without a name or length', () => {
        it('shows its number and status', () => {
          renderList([lupin]);

          expect(
            screen.getByText('Episode 2, In progress: 4 looked up, 0 asked AI'),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('a youtube channel', () => {
    describe('a video', () => {
      it('shows its url, length, where I am up to and comprehension', () => {
        renderList([hugo]);

        expect(
          screen.getByText(
            'https://youtu.be/1 (01:02:05), up to 00:20:00: 7 looked up, 1 asked AI',
          ),
        ).toBeInTheDocument();
      });

      describe('without a length', () => {
        it('shows its status', () => {
          renderList([hugo]);

          expect(
            screen.getByText(
              'https://youtu.be/2, Done: 0 looked up, 0 asked AI',
            ),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('a manga series', () => {
    it('shows where I am up to', () => {
      renderList([yotsuba]);

      expect(screen.getByText('Up to 1-2-41')).toBeInTheDocument();
    });

    it('shows each volume with its number and pages', () => {
      renderList([yotsuba]);

      expect(screen.getByText('Volume 1 (220 pages)')).toBeInTheDocument();
    });

    describe('a chapter', () => {
      it('shows its number, last page and comprehension', () => {
        renderList([yotsuba]);

        expect(
          screen.getByText(
            'Chapter 1 (to page 38): 20 looked up, 3 asked AI, 60% understood',
          ),
        ).toBeInTheDocument();
      });

      describe('with a name', () => {
        it('shows its name', () => {
          renderList([yotsuba]);

          expect(
            screen.getByText('よつばとアイス: 0 looked up, 0 asked AI'),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe('a book series', () => {
    it('shows each volume by name', () => {
      renderList([
        {
          id: 'asterix',
          type: 'book',
          name: 'Astérix',
          language: 'french',
          volumes: [{ number: 1, name: 'Astérix le Gaulois' }],
        },
      ]);

      expect(screen.getByText('Astérix le Gaulois')).toBeInTheDocument();
    });
  });
});
