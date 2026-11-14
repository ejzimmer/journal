import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { findCard, renderHomePage } from './homePageTestUtils';

const seed = {
  projects: {
    blanket: { id: 'blanket', name: 'Blanket', type: 'blanket' },
    sleeve: { id: 'sleeve', name: 'Laptop sleeve', type: 'accessory' },
    cardigan: { id: 'cardigan', name: 'Cardigan', type: 'cardigan' },
    socks: { id: 'socks', name: 'Socks for Dad', type: 'socks' },
  },
  lists: {
    meetings: {
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

      expect(findProjectNamesIn('Meetings')).toEqual([
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
        renderHomePage(seed);
        const card = within(findCard('Blanket'));

        await userEvent.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );
        await userEvent.click(
          card.getByRole('button', { name: 'Move to Concentration' }),
        );

        expect(findProjectNamesIn('Concentration')).toEqual([
          'Cardigan',
          'Blanket',
        ]);
        expect(findProjectNamesIn('Meetings')).toEqual(['Laptop sleeve']);
      });
    });

    describe('when the menu is open', () => {
      it('shows the current list as unavailable', async () => {
        renderHomePage(seed);
        const card = within(findCard('Socks for Dad'));

        await userEvent.click(
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
        renderHomePage(seed);

        await userEvent.type(
          screen.getByRole('textbox', { name: 'New project' }),
          'Mittens',
        );
        await userEvent.selectOptions(
          screen.getByRole('combobox', { name: 'Type' }),
          'Accessory',
        );
        await userEvent.click(
          screen.getByRole('button', { name: 'Add project' }),
        );

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Mittens',
        ]);
        expect(
          within(findCard('Mittens')).getByRole('img', { name: 'Accessory' }),
        ).toBeInTheDocument();
      });

      it('clears the name ready for the next project', async () => {
        renderHomePage(seed);
        const nameInput = screen.getByRole('textbox', { name: 'New project' });

        await userEvent.type(nameInput, 'Mittens{Enter}');

        expect(nameInput).toHaveValue('');
      });
    });

    describe('with only spaces for a name', () => {
      it('adds nothing', async () => {
        renderHomePage(seed);

        await userEvent.type(
          screen.getByRole('textbox', { name: 'New project' }),
          '   {Enter}',
        );

        expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
      });
    });
  });
});
