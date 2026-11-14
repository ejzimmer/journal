import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { findCard, renderHomePage } from '../homePageTestUtils';

const seed = {
  projects: {
    cardigan: {
      id: 'cardigan',
      name: 'Cardigan',
      type: 'cardigan',
      craft: 'knitting',
      pattern: { name: 'Telja Cardigan', url: 'https://example.com/telja' },
      yarns: {
        tweed: {
          id: 'tweed',
          name: 'Felted Tweed',
          position: 1,
          colourways: {
            mineral: {
              id: 'mineral',
              name: 'Mineral',
              skeins: 1.5,
              dyeLot: '0917',
              position: 1,
            },
          },
        },
      },
      gauge: { stitches: 22, rows: 30, needleMm: 4 },
      subtasks: {
        swatch: {
          id: 'swatch',
          description: 'Swatch',
          status: 'done',
          position: 1,
        },
      },
    },
    hat: { id: 'hat', name: 'Hat', type: 'hat' },
  },
  lists: {
    concentration: { cardigan: { id: 'cardigan', position: 1 } },
    future: { hat: { id: 'hat', position: 1 } },
  },
};

async function openEditForm(projectName: string) {
  const card = within(findCard(projectName));
  await userEvent.click(card.getByRole('button', { name: 'Expand project' }));
  await userEvent.click(card.getByRole('button', { name: 'Edit project' }));
}

async function saveChanges() {
  await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
}

async function openDetails(projectName: string) {
  const card = within(findCard(projectName));
  await userEvent.click(card.getByRole('button', { name: 'Details' }));
  return card;
}

describe('editing a project', () => {
  describe('when the form opens', () => {
    it('fills in the current details', async () => {
      renderHomePage(seed);

      await openEditForm('Cardigan');

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
        'Cardigan',
      );
      expect(screen.getByRole('button', { name: 'Knitting' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('button', { name: 'Cardigan' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(screen.getByRole('textbox', { name: 'Pattern' })).toHaveValue(
        'Telja Cardigan',
      );
      expect(screen.getByRole('textbox', { name: 'Yarn name' })).toHaveValue(
        'Felted Tweed',
      );
      expect(screen.getByRole('spinbutton', { name: 'Skeins' })).toHaveValue(
        1.5,
      );
      expect(
        screen.getByRole('spinbutton', { name: 'Needle size in mm' }),
      ).toHaveValue(4);
    });
  });

  describe('saving', () => {
    it('shows the new name and type on the card', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Telja');
      await userEvent.click(screen.getByRole('button', { name: 'Jumper' }));
      await saveChanges();

      const card = within(findCard('Telja'));
      expect(card.getByRole('img', { name: 'Jumper' })).toBeInTheDocument();
    });

    it('keeps the steps', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');

      await saveChanges();

      expect(
        within(findCard('Cardigan')).getByRole('checkbox', { name: 'Swatch' }),
      ).toBeChecked();
    });

    it('clears the craft when it is toggled off', async () => {
      renderHomePage(seed);
      const craftIcon = within(findCard('Cardigan')).getByRole('img', {
        name: 'Knitting',
      });
      await openEditForm('Cardigan');

      await userEvent.click(screen.getByRole('button', { name: 'Knitting' }));
      await saveChanges();

      expect(craftIcon).not.toBeInTheDocument();
    });

    it('adds a new yarn after the existing ones', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');

      await userEvent.click(screen.getByRole('button', { name: 'Add yarn' }));
      await userEvent.type(
        screen.getAllByRole('textbox', { name: 'Yarn name' })[1],
        'Kid-Silk',
      );
      await userEvent.type(
        screen.getAllByRole('textbox', { name: 'Colourway' })[1],
        'Beige',
      );
      await userEvent.type(
        screen.getAllByRole('spinbutton', { name: 'Skeins' })[1],
        '3',
      );
      await saveChanges();
      const card = await openDetails('Cardigan');

      expect(
        card
          .getAllByText(/Felted Tweed|Kid-Silk/)
          .map((yarnName) => yarnName.textContent),
      ).toEqual(['Felted Tweed', 'Kid-Silk']);
      expect(card.getByRole('img', { name: '3 skeins' })).toBeInTheDocument();
    });

    it('adds a new colourway after the existing ones', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');

      await userEvent.click(
        screen.getByRole('button', { name: 'Add colourway' }),
      );
      await userEvent.type(
        screen.getAllByRole('textbox', { name: 'Colourway' })[1],
        'Ancient',
      );
      await saveChanges();
      const card = await openDetails('Cardigan');

      expect(
        card
          .getAllByText(/Mineral|Ancient/)
          .map((colourway) => colourway.textContent),
      ).toEqual(['Mineral', 'Ancient']);
    });

    it('removes a yarn whose fields are all cleared', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');

      await userEvent.clear(screen.getByRole('textbox', { name: 'Yarn name' }));
      await userEvent.clear(screen.getByRole('textbox', { name: 'Colourway' }));
      await userEvent.clear(screen.getByRole('spinbutton', { name: 'Skeins' }));
      await userEvent.clear(screen.getByRole('textbox', { name: 'Dye lot' }));
      await saveChanges();
      await userEvent.click(
        within(findCard('Cardigan')).getByRole('button', {
          name: 'Edit project',
        }),
      );

      expect(
        within(screen.getByRole('group', { name: 'Yarn' })).getByRole('button'),
      ).toHaveAccessibleName('Add yarn');
    });

    it('adds details to a project that had none', async () => {
      renderHomePage(seed);
      await openEditForm('Hat');

      await userEvent.type(
        screen.getByRole('textbox', { name: 'Pattern' }),
        'Fair Isle tam',
      );
      await userEvent.type(
        screen.getByRole('spinbutton', { name: 'Needle size in mm' }),
        '3.25',
      );
      await saveChanges();
      const card = await openDetails('Hat');

      expect(card.getByText('Fair Isle tam')).toBeInTheDocument();
      expect(card.getByText('3.25 mm')).toBeInTheDocument();
    });

    describe('when the name is blank', () => {
      it('stays in edit mode', async () => {
        renderHomePage(seed);
        await openEditForm('Cardigan');

        await userEvent.clear(screen.getByRole('textbox', { name: 'Name' }));
        await saveChanges();

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInvalid();
      });
    });
  });

  describe('cancelling', () => {
    it('throws away the changes', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');

      await userEvent.type(screen.getByRole('textbox', { name: 'Name' }), '!!');
      await userEvent.click(
        screen.getByRole('button', { name: 'Cancel changes' }),
      );

      expect(findCard('Cardigan')).toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    it('removes the project once confirmed', async () => {
      renderHomePage(seed);
      await openEditForm('Cardigan');
      const nameInput = screen.getByRole('textbox', { name: 'Name' });

      await userEvent.click(
        screen.getByRole('button', { name: 'Delete project' }),
      );
      await userEvent.click(
        screen.getByRole('button', { name: 'Confirm delete project' }),
      );

      expect(nameInput).not.toBeInTheDocument();
      expect(
        screen.getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(['Hat']);
    });
  });
});
