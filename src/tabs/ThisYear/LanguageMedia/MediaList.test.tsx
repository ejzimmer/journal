import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaList } from './MediaList';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { hugo, lupin, yotsuba } from './testMedia';
import { LanguageMedia } from './types';

const renderList = (media: LanguageMedia[]) => ({
  user: userEvent.setup(),
  ...renderWithLanguageMediaStorage(<MediaList />, { media }),
});

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
          volumes: {
            vol1: { id: 'vol1', number: 1, name: 'Astérix le Gaulois' },
          },
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

        expect(storageContext.deleteItem).toHaveBeenCalledWith(['lupin']);
      });
    });

    describe('a season', () => {
      it('deletes it from storage', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Season 1' }),
        );

        expect(storageContext.deleteItem).toHaveBeenCalledWith([
          'lupin',
          'seasons',
          's1',
        ]);
      });
    });

    describe('an episode', () => {
      it('deletes it from storage', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Chapitre 1' }),
        );

        expect(storageContext.deleteItem).toHaveBeenCalledWith([
          'lupin',
          'seasons',
          's1',
          'episodes',
          'e1',
        ]);
      });
    });

    describe('a video', () => {
      it('deletes it from storage', async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.click(
          screen.getByRole('button', { name: 'Delete https://youtu.be/1' }),
        );

        expect(storageContext.deleteItem).toHaveBeenCalledWith([
          'hugo',
          'videos',
          'v1',
        ]);
      });
    });

    describe('a volume', () => {
      it('deletes it from storage', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Volume 1' }),
        );

        expect(storageContext.deleteItem).toHaveBeenCalledWith([
          'yotsuba',
          'volumes',
          'vol1',
        ]);
      });
    });

    describe('a chapter', () => {
      it('deletes it from storage', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(
          screen.getByRole('button', { name: 'Delete Chapter 1' }),
        );

        expect(storageContext.deleteItem).toHaveBeenCalledWith([
          'yotsuba',
          'volumes',
          'vol1',
          'chapters',
          'c1',
        ]);
      });
    });
  });

  describe('adding', () => {
    describe('a season', () => {
      it('adds it to the series', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(screen.getByRole('button', { name: 'Add season' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['lupin', 'seasons'],
          { number: 2 },
        );
      });

      describe('with a number of episodes', () => {
        it('adds each episode to the new season', async () => {
          const { user, storageContext } = renderList([lupin]);
          jest.mocked(storageContext.addItem).mockReturnValueOnce('s2');

          await user.type(
            screen.getByRole('spinbutton', { name: 'Episodes' }),
            '1',
          );
          await user.click(screen.getByRole('button', { name: 'Add season' }));

          expect(storageContext.addItem).toHaveBeenLastCalledWith(
            ['lupin', 'seasons', 's2', 'episodes'],
            { number: 1, lookups: 0, aiQuestions: 0 },
          );
        });
      });
    });

    describe('an episode', () => {
      it('adds it to the season', async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(screen.getByRole('button', { name: 'Add episode' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['lupin', 'seasons', 's1', 'episodes'],
          { number: 3, lookups: 0, aiQuestions: 0 },
        );
      });
    });

    describe('a video', () => {
      it('adds it to the channel', async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.type(
          within(screen.getByRole('form', { name: 'Add video' })).getByRole(
            'textbox',
            { name: 'URL' },
          ),
          'https://youtu.be/3',
        );
        await user.click(screen.getByRole('button', { name: 'Add video' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['hugo', 'videos'],
          { url: 'https://youtu.be/3', lookups: 0, aiQuestions: 0 },
        );
      });
    });

    describe('a volume', () => {
      it('adds it to the series', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['yotsuba', 'volumes'],
          { number: 2 },
        );
      });
    });

    describe('a chapter', () => {
      it('adds it to the volume', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await user.click(screen.getByRole('button', { name: 'Add chapter' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['yotsuba', 'volumes', 'vol1', 'chapters'],
          { number: 3, lookups: 0, aiQuestions: 0 },
        );
      });
    });
  });

  describe('editing', () => {
    const renameIn = async (
      user: ReturnType<typeof userEvent.setup>,
      formName: string,
      name: string,
    ) => {
      await user.click(screen.getByLabelText(formName));
      const form = screen.getByRole('form', { name: formName });
      await user.clear(within(form).getByRole('textbox', { name: 'Name' }));
      await user.type(
        within(form).getByRole('textbox', { name: 'Name' }),
        name,
      );
      await user.click(within(form).getByRole('button', { name: 'Save' }));
    };

    describe('a series', () => {
      it('saves the changed details', async () => {
        const { user, storageContext } = renderList([lupin]);

        await renameIn(user, 'Edit Lupin', 'ルパン');

        expect(storageContext.updateItem).toHaveBeenCalledWith(['lupin'], {
          name: 'ルパン',
          language: 'french',
        });
      });
    });

    describe('an episode', () => {
      it('saves the changed details to the episode', async () => {
        const { user, storageContext } = renderList([lupin]);

        await renameIn(user, 'Edit Chapitre 1', 'Pilote');

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['lupin', 'seasons', 's1', 'episodes', 'e1'],
          { number: 1, name: 'Pilote', lengthInSeconds: 2826 },
        );
      });
    });

    describe('a video', () => {
      it('saves the changed details to the video', async () => {
        const { user, storageContext } = renderList([hugo]);
        await user.click(screen.getByLabelText('Edit https://youtu.be/2'));
        const form = screen.getByRole('form', {
          name: 'Edit https://youtu.be/2',
        });

        await user.type(
          within(form).getByRole('textbox', { name: 'Minutes' }),
          '10',
        );
        await user.click(within(form).getByRole('button', { name: 'Save' }));

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['hugo', 'videos', 'v2'],
          { url: 'https://youtu.be/2', lengthInSeconds: 600 },
        );
      });
    });

    describe('a chapter', () => {
      it('saves the changed details to the chapter', async () => {
        const { user, storageContext } = renderList([yotsuba]);

        await renameIn(user, 'Edit Chapter 1', 'よつばとあさがお');

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['yotsuba', 'volumes', 'vol1', 'chapters', 'c1'],
          { number: 1, name: 'よつばとあさがお', lastPage: 38 },
        );
      });
    });
  });
});
