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

  describe('a manga or book series', () => {
    it('is left for the garden', () => {
      renderList([yotsuba]);

      expect(screen.getByRole('list')).toBeEmptyDOMElement();
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
  });

  describe('updating progress', () => {
    const saveIn = async (
      user: ReturnType<typeof userEvent.setup>,
      formName: string,
      fieldRole: 'spinbutton' | 'textbox',
      fieldName: string,
      value: string,
    ) => {
      await user.click(screen.getByLabelText(formName));
      const form = screen.getByRole('form', { name: formName });
      const field = within(form).getByRole(fieldRole, { name: fieldName });
      await user.clear(field);
      await user.type(field, value);
      await user.click(within(form).getByRole('button', { name: 'Save' }));
    };

    describe('of a tv series', () => {
      it('saves where I am up to', async () => {
        const { user, storageContext } = renderList([lupin]);

        await saveIn(
          user,
          "Update where I'm up to",
          'spinbutton',
          'Episode',
          '3',
        );

        expect(storageContext.updateItem).toHaveBeenCalledWith(['lupin'], {
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

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['lupin', 'seasons', 's1', 'episodes', 'e2'],
          { status: 'done' },
        );
      });
    });

    describe('of a video with a length', () => {
      it('saves where I am up to in it', async () => {
        const { user, storageContext } = renderList([hugo]);

        await saveIn(
          user,
          "Update where I'm up to in https://youtu.be/1",
          'textbox',
          'Minutes',
          '30',
        );

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['hugo', 'videos', 'v1'],
          { upToInSeconds: 1800 },
        );
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

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['hugo', 'videos', 'v2'],
          { status: 'in-progress' },
        );
      });
    });
  });

  describe('counting', () => {
    describe('a lookup in an episode', () => {
      it("saves only the episode's new lookup count", async () => {
        const { user, storageContext } = renderList([lupin]);

        await user.click(
          screen.getByRole('button', { name: 'Add a lookup to Chapitre 1' }),
        );

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['lupin', 'seasons', 's1', 'episodes', 'e1'],
          { lookups: 13 },
        );
      });
    });

    describe('an AI question about a video', () => {
      it("saves only the video's new AI question count", async () => {
        const { user, storageContext } = renderList([hugo]);

        await user.click(
          screen.getByRole('button', {
            name: 'Add an AI question to https://youtu.be/1',
          }),
        );

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          ['hugo', 'videos', 'v1'],
          { aiQuestions: 2 },
        );
      });
    });
  });
});
