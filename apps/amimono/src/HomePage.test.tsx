import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HomePage } from './HomePage';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';

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

function renderHomePage() {
  render(
    <FirebaseContext.Provider value={createMockFirebaseContext(seed)}>
      <HomePage />
    </FirebaseContext.Provider>,
  );
}

function findProjectNamesIn(listName: string) {
  return within(screen.getByRole('list', { name: listName }))
    .getAllByRole('listitem')
    .map((card) => card.textContent);
}

function findCard(projectName: string) {
  const card = screen
    .getAllByRole('listitem')
    .find((listItem) => listItem.textContent === projectName);
  if (!card) throw new Error(`No card for ${projectName}`);
  return card;
}

describe('HomePage', () => {
  describe('showing the lists', () => {
    it('shows each list in position order', () => {
      renderHomePage();

      expect(findProjectNamesIn('Meetings')).toEqual([
        'Blanket',
        'Laptop sleeve',
      ]);
      expect(findProjectNamesIn('Concentration')).toEqual(['Cardigan']);
      expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
    });

    it('labels each card with its project type', () => {
      renderHomePage();

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
        renderHomePage();
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
        renderHomePage();
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
        renderHomePage();

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
        renderHomePage();
        const nameInput = screen.getByRole('textbox', { name: 'New project' });

        await userEvent.type(nameInput, 'Mittens{Enter}');

        expect(nameInput).toHaveValue('');
      });
    });

    describe('with only spaces for a name', () => {
      it('adds nothing', async () => {
        renderHomePage();

        await userEvent.type(
          screen.getByRole('textbox', { name: 'New project' }),
          '   {Enter}',
        );

        expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
      });
    });
  });
});
