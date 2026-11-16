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
    concentration: { cardigan: { id: 'cardigan', position: 1 } },
    future: { socks: { id: 'socks', position: 1 } },
  },
};

function findProjectNamesIn(listName: string) {
  return within(screen.getByRole('list', { name: listName }))
    .getAllByRole('listitem')
    .map((card) => card.querySelector('.project-name')?.textContent);
}

describe('HomePage', () => {
  describe('showing the lists', () => {
    it('shows each list in position order', () => {
      renderHomePage(seed);

      expect(findProjectNamesIn('Portable')).toEqual([
        'Blanket',
        'Laptop sleeve',
      ]);
      expect(findProjectNamesIn('Concentration')).toEqual(['Cardigan']);
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
    describe('to another list', () => {
      it('puts it at the end of that list', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Blanket'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );
        await user.click(
          card.getByRole('button', { name: 'Move to Concentration' }),
        );

        expect(findProjectNamesIn('Concentration')).toEqual([
          'Cardigan',
          'Blanket',
        ]);
        expect(findProjectNamesIn('Portable')).toEqual(['Laptop sleeve']);
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
        await user.selectOptions(
          screen.getByRole('combobox', { name: 'Type' }),
          'Accessory',
        );
        await user.click(screen.getByRole('button', { name: 'Add project' }));

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Mittens',
        ]);
        expect(
          within(findCard('Mittens')).getByRole('img', { name: 'Accessory' }),
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
