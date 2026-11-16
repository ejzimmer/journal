import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { findCard, renderHomePage } from '../homePageTestUtils';

const seed = {
  projects: {
    cardigan: {
      id: 'cardigan',
      name: 'Cardigan',
      type: 'cardigan',
      craft: 'knitting',
      pattern: {
        name: 'Telja Cardigan',
        url: 'https://www.ravelry.com/patterns/library/telja-cardigan',
      },
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
    priority: { cardigan: { id: 'cardigan', position: 1 } },
    future: { hat: { id: 'hat', position: 1 } },
  },
};

async function openEditForm(user: UserEvent, projectName: string) {
  const card = within(findCard(projectName));
  await user.click(card.getByRole('button', { name: 'Expand project' }));
  await user.click(card.getByRole('button', { name: 'Edit project' }));
}

describe('editing a project', () => {
  describe('when the form opens', () => {
    it('selects the current type', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');
      const form = within(screen.getByRole('form', { name: 'Edit project' }));

      await user.click(form.getByRole('combobox', { name: 'Type' }));

      expect(
        form.getByRole('option', { name: 'Cardigan', selected: true }),
      ).toBeInTheDocument();
    });

    it('fills in the current details', async () => {
      const { user } = renderHomePage(seed);

      await openEditForm(user, 'Cardigan');

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
        'Cardigan',
      );
      expect(
        within(screen.getByRole('form', { name: 'Edit project' })).getByRole(
          'radio',
          { name: 'Knitting' },
        ),
      ).toBeChecked();
      expect(screen.getByRole('textbox', { name: 'Pattern' })).toHaveValue(
        'https://www.ravelry.com/patterns/library/telja-cardigan',
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
    it('shows the new name and type on the card, with its subtasks kept', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');

      const nameInput = screen.getByRole('textbox', { name: 'Name' });
      await user.clear(nameInput);
      await user.type(nameInput, 'Telja');
      const form = within(screen.getByRole('form', { name: 'Edit project' }));
      await user.click(form.getByRole('combobox', { name: 'Type' }));
      await user.click(form.getByRole('option', { name: 'Jumper' }));
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      const card = within(findCard('Telja'));
      expect(card.getByRole('img', { name: 'Jumper' })).toBeInTheDocument();
      expect(card.getByRole('checkbox', { name: 'Swatch' })).toBeChecked();
    });

    it('shows the chosen craft on the card', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Hat');

      await user.click(
        within(screen.getByRole('form', { name: 'Edit project' })).getByRole(
          'radio',
          { name: 'Crochet' },
        ),
      );
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(
        within(findCard('Hat')).getByRole('img', { name: 'Crochet' }),
      ).toBeInTheDocument();
    });

    it('adds a new yarn after the existing ones', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');

      await user.click(screen.getByRole('button', { name: 'Add yarn' }));
      await user.type(
        screen.getAllByRole('textbox', { name: 'Yarn name' })[1],
        'Kid-Silk',
      );
      await user.type(
        screen.getAllByRole('textbox', { name: 'Colourway' })[1],
        'Beige',
      );
      await user.type(
        screen.getAllByRole('spinbutton', { name: 'Skeins' })[1],
        '3',
      );
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Details' }));

      expect(
        card
          .getAllByText(/Felted Tweed|Kid-Silk/)
          .map((yarnName) => yarnName.textContent),
      ).toEqual(['Felted Tweed', 'Kid-Silk']);
      expect(card.getByRole('img', { name: '3 skeins' })).toBeInTheDocument();
    });

    it('adds a new colourway after the existing ones', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');

      await user.click(screen.getByRole('button', { name: 'Add colourway' }));
      await user.type(
        screen.getAllByRole('textbox', { name: 'Colourway' })[1],
        'Ancient',
      );
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Details' }));

      expect(
        card
          .getAllByText(/Mineral|Ancient/)
          .map((colourway) => colourway.textContent),
      ).toEqual(['Mineral', 'Ancient']);
    });

    it('removes a yarn whose fields are all cleared', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');

      await user.clear(screen.getByRole('textbox', { name: 'Yarn name' }));
      await user.clear(screen.getByRole('textbox', { name: 'Colourway' }));
      await user.clear(screen.getByRole('spinbutton', { name: 'Skeins' }));
      await user.clear(screen.getByRole('textbox', { name: 'Dye lot' }));
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      await user.click(
        within(findCard('Cardigan')).getByRole('button', {
          name: 'Edit project',
        }),
      );

      expect(
        within(screen.getByRole('group', { name: 'Yarn' })).getByRole('button'),
      ).toHaveAccessibleName('Add yarn');
    });

    it('adds details to a project that had none', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Hat');

      await user.type(
        screen.getByRole('textbox', { name: 'Pattern' }),
        'Fair Isle tam',
      );
      await user.type(
        screen.getByRole('spinbutton', { name: 'Needle size in mm' }),
        '3.25',
      );
      await user.click(screen.getByRole('button', { name: 'Save changes' }));
      const card = within(findCard('Hat'));
      await user.click(card.getByRole('button', { name: 'Details' }));

      expect(card.getByText('Fair Isle tam')).toBeInTheDocument();
      expect(card.getByText('3.25 mm')).toBeInTheDocument();
    });

    describe('when the pattern is a Ravelry link', () => {
      it('links the pattern under the name from the link', async () => {
        const { user } = renderHomePage(seed);
        await openEditForm(user, 'Hat');

        await user.type(
          screen.getByRole('textbox', { name: 'Pattern' }),
          'https://www.ravelry.com/patterns/library/lucca-hat',
        );
        await user.click(screen.getByRole('button', { name: 'Save changes' }));
        const card = within(findCard('Hat'));
        await user.click(card.getByRole('button', { name: 'Details' }));

        expect(card.getByRole('link', { name: 'Lucca Hat' })).toHaveAttribute(
          'href',
          'https://www.ravelry.com/patterns/library/lucca-hat',
        );
      });
    });

    describe('when the pattern is some other link', () => {
      it('links the pattern under the link itself', async () => {
        const { user } = renderHomePage(seed);
        await openEditForm(user, 'Hat');

        await user.type(
          screen.getByRole('textbox', { name: 'Pattern' }),
          'https://example.com/tam',
        );
        await user.click(screen.getByRole('button', { name: 'Save changes' }));
        const card = within(findCard('Hat'));
        await user.click(card.getByRole('button', { name: 'Details' }));

        expect(
          card.getByRole('link', { name: 'https://example.com/tam' }),
        ).toHaveAttribute('href', 'https://example.com/tam');
      });
    });

    describe('when the name is blank', () => {
      it('stays in edit mode', async () => {
        const { user } = renderHomePage(seed);
        await openEditForm(user, 'Cardigan');

        await user.clear(screen.getByRole('textbox', { name: 'Name' }));
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInvalid();
      });
    });

    describe('when the name is only spaces', () => {
      it('stays in edit mode', async () => {
        const { user } = renderHomePage(seed);
        await openEditForm(user, 'Cardigan');

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await user.clear(nameInput);
        await user.type(nameInput, '   ');
        await user.click(screen.getByRole('button', { name: 'Save changes' }));

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeInvalid();
      });
    });
  });

  describe('cancelling', () => {
    it('throws away the changes', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');

      await user.type(screen.getByRole('textbox', { name: 'Name' }), '!!');
      await user.click(screen.getByRole('button', { name: 'Cancel changes' }));

      expect(findCard('Cardigan')).toBeInTheDocument();
    });
  });

  describe('deleting', () => {
    it('removes the project once confirmed', async () => {
      const { user } = renderHomePage(seed);
      await openEditForm(user, 'Cardigan');
      const nameInput = screen.getByRole('textbox', { name: 'Name' });

      await user.click(screen.getByRole('button', { name: 'Delete project' }));
      await user.click(
        screen.getByRole('button', { name: 'Confirm delete project' }),
      );

      expect(nameInput).not.toBeInTheDocument();
      expect(
        screen.getAllByRole('listitem').map((item) => item.textContent),
      ).toEqual(['Hat']);
    });
  });
});
