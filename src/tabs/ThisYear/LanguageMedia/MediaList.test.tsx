import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaList } from './MediaList';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { LanguageMedia, PrintSeries, TvSeries, YoutubeChannel } from './types';

const renderList = (media: LanguageMedia[]) => ({
  user: userEvent.setup(),
  ...renderWithLanguageMediaStorage(<MediaList />, { media }),
});

const lupin: TvSeries = {
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

const hugo: YoutubeChannel = {
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

const yotsuba: PrintSeries = {
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

  describe('deleting', () => {
    describe('a series', () => {
      it('deletes it from storage', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(screen.getByRole('button', { name: 'Delete Lupin' }));

        expect(storageContext.deleteMedia).toHaveBeenCalledWith(lupin);
      });
    });

    describe('a season', () => {
      it('saves the series without it', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Season 1' }),
        );

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [],
        });
      });
    });

    describe('an episode', () => {
      it('saves the series without it', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Chapitre 1' }),
        );

        const [season] = lupin.seasons!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [{ ...season, episodes: [season.episodes![1]] }],
        });
      });
    });

    describe('a video', () => {
      it('saves the channel without it', async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.click(
          screen.getByRole('button', { name: 'Delete https://youtu.be/1' }),
        );

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...hugo,
          videos: [hugo.videos![1]],
        });
      });
    });

    describe('a volume', () => {
      it('saves the series without it', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Volume 1' }),
        );

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [],
        });
      });
    });

    describe('a chapter', () => {
      it('saves the series without it', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Chapter 1' }),
        );

        const [volume] = yotsuba.volumes!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [{ ...volume, chapters: [volume.chapters![1]] }],
        });
      });
    });
  });

  describe('adding', () => {
    describe('a season', () => {
      it('saves the series with it', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(screen.getByRole('button', { name: 'Add season' }));

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [...lupin.seasons!, { number: 2, episodes: [] }],
        });
      });
    });

    describe('an episode', () => {
      it('saves the series with it', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(screen.getByRole('button', { name: 'Add episode' }));

        const [season] = lupin.seasons!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [
            {
              ...season,
              episodes: [
                ...season.episodes!,
                { number: 3, lookups: 0, aiQuestions: 0 },
              ],
            },
          ],
        });
      });
    });

    describe('a video', () => {
      it('saves the channel with it', async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.type(
          within(screen.getByRole('form', { name: 'Add video' })).getByRole(
            'textbox',
            { name: 'URL' },
          ),
          'https://youtu.be/3',
        );
        await user.click(screen.getByRole('button', { name: 'Add video' }));

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...hugo,
          videos: [
            ...hugo.videos!,
            { url: 'https://youtu.be/3', lookups: 0, aiQuestions: 0 },
          ],
        });
      });
    });

    describe('a volume', () => {
      it('saves the series with it', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [...yotsuba.volumes!, { number: 2 }],
        });
      });
    });

    describe('a chapter', () => {
      it('saves the series with it', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(screen.getByRole('button', { name: 'Add chapter' }));

        const [volume] = yotsuba.volumes!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [
            {
              ...volume,
              chapters: [
                ...volume.chapters!,
                { number: 3, lookups: 0, aiQuestions: 0 },
              ],
            },
          ],
        });
      });
    });
  });

  describe('editing', () => {
    const renameIn = async (
      user: ReturnType<typeof userEvent.setup>,
      formName: string,
      name: string,
    ) => {
      const form = screen.getByRole('form', { name: formName });
      await user.clear(within(form).getByRole('textbox', { name: 'Name' }));
      await user.type(
        within(form).getByRole('textbox', { name: 'Name' }),
        name,
      );
      await user.click(within(form).getByRole('button', { name: 'Save' }));
    };

    describe('a series', () => {
      it('saves it', async () => {
        const { user, storageContext } = renderList([lupin]);

        await renameIn(user, 'Edit Lupin', 'ルパン');

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          name: 'ルパン',
        });
      });
    });

    describe('an episode', () => {
      it('saves the series with the change', async () => {
        const { user, storageContext } = renderList([lupin]);

        await renameIn(user, 'Edit Chapitre 1', 'Pilote');

        const [season] = lupin.seasons!;
        const [episode, otherEpisode] = season.episodes!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [
            {
              ...season,
              episodes: [{ ...episode, name: 'Pilote' }, otherEpisode],
            },
          ],
        });
      });
    });

    describe('a video', () => {
      it('saves the channel with the change', async () => {
        const { user, storageContext } = renderList([hugo]);
        const form = screen.getByRole('form', {
          name: 'Edit https://youtu.be/2',
        });

        await user.type(
          within(form).getByRole('textbox', { name: 'Length' }),
          '0:10:00',
        );
        await user.click(within(form).getByRole('button', { name: 'Save' }));

        const [video, otherVideo] = hugo.videos!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...hugo,
          videos: [video, { ...otherVideo, lengthInSeconds: 600 }],
        });
      });
    });

    describe('a chapter', () => {
      it('saves the series with the change', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await renameIn(user, 'Edit Chapter 1', 'よつばとあさがお');

        const [volume] = yotsuba.volumes!;
        const [chapter, otherChapter] = volume.chapters!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [
            {
              ...volume,
              chapters: [
                { ...chapter, name: 'よつばとあさがお' },
                otherChapter,
              ],
            },
          ],
        });
      });
    });
  });

  describe('updating progress', () => {
    describe('of a tv series', () => {
      it('saves where I am up to', async () => {
        const { user, storageContext } = renderList([lupin]);
        const form = screen.getByRole('form', {
          name: "Update where I'm up to",
        });

        await user.clear(
          within(form).getByRole('spinbutton', { name: 'Episode' }),
        );
        await user.type(
          within(form).getByRole('spinbutton', { name: 'Episode' }),
          '3',
        );
        await user.click(within(form).getByRole('button', { name: 'Save' }));

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          upTo: { ...lupin.upTo, episode: 3 },
        });
      });
    });

    describe('of an episode without a length', () => {
      it('saves its status', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.selectOptions(
          screen.getByRole('combobox', { name: 'Status of Episode 2' }),
          'Done',
        );

        const [season] = lupin.seasons!;
        const [episode, otherEpisode] = season.episodes!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [
            {
              ...season,
              episodes: [episode, { ...otherEpisode, status: 'done' }],
            },
          ],
        });
      });
    });

    describe('of a video with a length', () => {
      it('saves where I am up to in it', async () => {
        const { user, storageContext } = renderList([hugo]);
        const form = screen.getByRole('form', {
          name: "Update where I'm up to in https://youtu.be/1",
        });

        await user.clear(
          within(form).getByRole('textbox', { name: 'Timestamp' }),
        );
        await user.type(
          within(form).getByRole('textbox', { name: 'Timestamp' }),
          '0:30:00',
        );
        await user.click(within(form).getByRole('button', { name: 'Save' }));

        const [video, otherVideo] = hugo.videos!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...hugo,
          videos: [{ ...video, upToInSeconds: 1800 }, otherVideo],
        });
      });
    });

    describe('of a video without a length', () => {
      it('saves its status', async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.selectOptions(
          screen.getByRole('combobox', {
            name: 'Status of https://youtu.be/2',
          }),
          'In progress',
        );

        const [video, otherVideo] = hugo.videos!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...hugo,
          videos: [video, { ...otherVideo, status: 'in-progress' }],
        });
      });
    });

    describe('of a manga series', () => {
      it('saves where I am up to', async () => {
        const { user, storageContext } = renderList([yotsuba]);
        const form = screen.getByRole('form', {
          name: "Update where I'm up to",
        });

        await user.clear(
          within(form).getByRole('spinbutton', { name: 'Page' }),
        );
        await user.type(
          within(form).getByRole('spinbutton', { name: 'Page' }),
          '45',
        );
        await user.click(within(form).getByRole('button', { name: 'Save' }));

        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          upTo: { ...yotsuba.upTo, page: 45 },
        });
      });
    });

    describe('of a chapter without a last page', () => {
      it('saves its status', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.selectOptions(
          screen.getByRole('combobox', { name: 'Status of よつばとアイス' }),
          'In progress',
        );

        const [volume] = yotsuba.volumes!;
        const [chapter, otherChapter] = volume.chapters!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [
            {
              ...volume,
              chapters: [chapter, { ...otherChapter, status: 'in-progress' }],
            },
          ],
        });
      });
    });
  });

  describe('counting', () => {
    describe('a lookup in an episode', () => {
      it('saves the series with the new count', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(
          screen.getByRole('button', { name: 'Add a lookup to Chapitre 1' }),
        );

        const [season] = lupin.seasons!;
        const [episode, otherEpisode] = season.episodes!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...lupin,
          seasons: [
            {
              ...season,
              episodes: [{ ...episode, lookups: 13 }, otherEpisode],
            },
          ],
        });
      });
    });

    describe('an AI question about a video', () => {
      it('saves the channel with the new count', async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.click(
          screen.getByRole('button', {
            name: 'Add an AI question to https://youtu.be/1',
          }),
        );

        const [video, otherVideo] = hugo.videos!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...hugo,
          videos: [{ ...video, aiQuestions: 2 }, otherVideo],
        });
      });
    });

    describe('a lookup in a chapter', () => {
      it('saves the series with the new count', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(
          screen.getByRole('button', { name: 'Add a lookup to Chapter 1' }),
        );

        const [volume] = yotsuba.volumes!;
        const [chapter, otherChapter] = volume.chapters!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [
            {
              ...volume,
              chapters: [{ ...chapter, lookups: 21 }, otherChapter],
            },
          ],
        });
      });
    });
  });

  describe('editing totals', () => {
    describe('of a chapter', () => {
      it('saves the series with the new totals', async () => {
        const { user, storageContext } = renderList([yotsuba]);
        const form = screen.getByRole('form', {
          name: 'Edit totals for Chapter 1',
        });
        const understood = within(form).getByRole('spinbutton', {
          name: 'Understood (%)',
        });

        await user.clear(understood);
        await user.type(understood, '75');
        await user.click(within(form).getByRole('button', { name: 'Save' }));

        const [volume] = yotsuba.volumes!;
        const [chapter, otherChapter] = volume.chapters!;
        expect(storageContext.updateMedia).toHaveBeenCalledWith({
          ...yotsuba,
          volumes: [
            {
              ...volume,
              chapters: [{ ...chapter, understood: 75 }, otherChapter],
            },
          ],
        });
      });
    });
  });
});
