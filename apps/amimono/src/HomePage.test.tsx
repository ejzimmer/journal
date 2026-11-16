import { screen, within } from '@testing-library/react';

import { findCard, renderHomePage } from './homePageTestUtils';

const seed = {
  projects: {
    blanket: { id: 'blanket', name: 'Blanket', type: 'blanket' },
    sleeve: { id: 'sleeve', name: 'Laptop sleeve', type: 'accessory' },
    cardigan: { id: 'cardigan', name: 'Cardigan', type: 'cardigan' },
    socks: { id: 'socks', name: 'Socks for Dad', type: 'socks' },
  },
  lists: {
    portable: {
      sleeve: { id: 'sleeve', position: 2 },
      blanket: { id: 'blanket', position: 1 },
    },
    priority: { cardigan: { id: 'cardigan', position: 1 } },
    future: { socks: { id: 'socks', position: 1 } },
  },
};

function findProjectNamesIn(listName: string) {
  return within(screen.getByRole('list', { name: listName }))
    .getAllByRole('listitem')
    .map((card) => card.querySelector('.project-name')?.textContent);
}

async function moveProject(
  user: ReturnType<typeof renderHomePage>['user'],
  projectName: string,
  listName: string,
) {
  const card = within(findCard(projectName));
  await user.click(card.getByRole('button', { name: 'Move to another list' }));
  await user.click(card.getByRole('button', { name: `Move to ${listName}` }));
}

describe('HomePage', () => {
  describe('showing the lists', () => {
    it('shows each list in position order', () => {
      renderHomePage(seed);

      expect(findProjectNamesIn('Portable')).toEqual([
        'Blanket',
        'Laptop sleeve',
      ]);
      expect(findProjectNamesIn('Priority')).toEqual(['Cardigan']);
      expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
    });

    it('labels each card with its project type', () => {
      renderHomePage(seed);

      expect(
        within(findCard('Laptop sleeve')).getByRole('img', {
          name: 'Accessory',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('moving a project', () => {
    describe('from the future list into a queue', () => {
      it('puts it at the bottom of the queue', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Socks for Dad'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );
        await user.click(
          card.getByRole('button', { name: 'Move to Priority' }),
        );

        expect(findProjectNamesIn('Priority')).toEqual([
          'Cardigan',
          'Socks for Dad',
        ]);
      });
    });

    describe('between the portable and priority queues', () => {
      describe('from portable to priority', () => {
        it('puts it at the top of priority', async () => {
          const { user } = renderHomePage(seed);

          await moveProject(user, 'Laptop sleeve', 'Priority');

          expect(findProjectNamesIn('Priority')).toEqual([
            'Laptop sleeve',
            'Cardigan',
          ]);
          expect(findProjectNamesIn('Portable')).toEqual(['Blanket']);
        });
      });

      describe('from priority to portable', () => {
        describe('when it came from portable', () => {
          it('puts it back where it was', async () => {
            const { user } = renderHomePage(seed);
            await moveProject(user, 'Laptop sleeve', 'Priority');

            await moveProject(user, 'Laptop sleeve', 'Portable');

            expect(findProjectNamesIn('Portable')).toEqual([
              'Blanket',
              'Laptop sleeve',
            ]);
          });
        });

        describe('when it came from somewhere else', () => {
          it('puts it at the top of portable', async () => {
            const { user } = renderHomePage(seed);

            await moveProject(user, 'Cardigan', 'Portable');

            expect(findProjectNamesIn('Portable')).toEqual([
              'Cardigan',
              'Blanket',
              'Laptop sleeve',
            ]);
          });
        });
      });
    });

    describe('from a queue to the future list', () => {
      it('puts it at the end of the future list', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Cardigan'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );
        await user.click(card.getByRole('button', { name: 'Move to Future' }));

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Cardigan',
        ]);
      });
    });

    describe('when the menu is open', () => {
      it('shows the current list as unavailable', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Socks for Dad'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );

        expect(
          card.getByRole('button', { name: 'Future (current list)' }),
        ).toBeDisabled();
      });
    });
  });

  describe('adding a project', () => {
    describe('with a name', () => {
      it('adds it to the end of the future list with the chosen type', async () => {
        const { user } = renderHomePage(seed);

        await user.type(
          screen.getByRole('textbox', { name: 'New project' }),
          'Mittens',
        );
        await user.click(screen.getByRole('combobox', { name: 'Type' }));
        await user.click(screen.getByRole('option', { name: 'Accessory' }));
        await user.click(screen.getByRole('button', { name: 'Add project' }));

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Mittens',
        ]);
        expect(
          within(findCard('Mittens')).getByRole('img', { name: 'Accessory' }),
        ).toBeInTheDocument();
      });

      it('shows the chosen craft on the card', async () => {
        const { user } = renderHomePage(seed);

        await user.type(
          screen.getByRole('textbox', { name: 'New project' }),
          'Mittens',
        );
        await user.click(screen.getByRole('radio', { name: 'Crochet' }));
        await user.click(screen.getByRole('button', { name: 'Add project' }));

        expect(
          within(findCard('Mittens')).getByRole('img', { name: 'Crochet' }),
        ).toBeInTheDocument();
      });

      it('clears the name ready for the next project', async () => {
        const { user } = renderHomePage(seed);
        const nameInput = screen.getByRole('textbox', { name: 'New project' });

        await user.type(nameInput, 'Mittens{Enter}');

        expect(nameInput).toHaveValue('');
      });
    });

    describe('with only spaces for a name', () => {
      it('adds nothing', async () => {
        const { user } = renderHomePage(seed);

        const nameInput = screen.getByRole('textbox', { name: 'New project' });

        await user.type(nameInput, '   {Enter}');

        expect(nameInput).toBeInvalid();
        expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
      });
    });
  });
});
