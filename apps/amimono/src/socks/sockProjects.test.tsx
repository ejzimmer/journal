import { screen, within } from '@testing-library/react';

import { findCard, renderHomePage } from '../homePageTestUtils';

const createSeed = (project: Record<string, unknown>) => ({
  projects: {
    socks: { id: 'socks', description: 'Socks for Dad', ...project },
  },
  lists: { portable: { socks: { id: 'socks', position: 1 } } },
});

describe('sock projects', () => {
  describe('when the project has sock progress', () => {
    const seed = createSeed({
      type: 'socks',
      socks: {
        direction: 'cuff_down',
        knittedSections: { first: 6, second: 2 },
      },
      subtasks: {
        swatch: {
          id: 'swatch',
          description: 'Swatch',
          status: 'done',
          position: 1,
        },
      },
    });

    it('counts knitted sections alongside the subtasks', () => {
      renderHomePage(seed);

      expect(
        within(findCard('Socks for Dad')).getByText('9 of 13'),
      ).toBeInTheDocument();
    });

    describe('knitting another section', () => {
      it('updates the progress on the card', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Socks for Dad'));
        await user.click(card.getByRole('button', { name: 'Expand project' }));

        await user.click(
          within(card.getByRole('slider', { name: 'second sock' })).getByText(
            'Knit heel',
          ),
        );

        expect(card.getByText('10 of 13')).toBeInTheDocument();
      });
    });
  });

  describe('when a new socks project has no progress yet', () => {
    it('starts both socks unknitted', async () => {
      const { user } = renderHomePage(createSeed({ type: 'socks' }));
      const card = within(findCard('Socks for Dad'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      expect(
        card
          .getAllByRole('slider')
          .map((sock) => sock.getAttribute('aria-valuenow')),
      ).toEqual(['0', '0']);
    });

    describe('knitting the first section', () => {
      it('shows the progress on the card', async () => {
        const { user } = renderHomePage(createSeed({ type: 'socks' }));
        const card = within(findCard('Socks for Dad'));
        await user.click(card.getByRole('button', { name: 'Expand project' }));

        await user.click(
          within(card.getByRole('slider', { name: 'first sock' })).getByText(
            'Knit cuff',
          ),
        );

        expect(card.getByText('1 of 12')).toBeInTheDocument();
      });
    });
  });

  describe('changing the type away from socks', () => {
    it('stops counting the sock sections', async () => {
      const { user } = renderHomePage(
        createSeed({
          type: 'socks',
          socks: {
            direction: 'cuff_down',
            knittedSections: { first: 3, second: 0 },
          },
          subtasks: {
            swatch: {
              id: 'swatch',
              description: 'Swatch',
              status: 'done',
              position: 1,
            },
          },
        }),
      );
      const card = within(findCard('Socks for Dad'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.click(card.getByRole('button', { name: 'Edit project' }));
      const form = within(screen.getByRole('form', { name: 'Edit project' }));
      await user.click(form.getByRole('combobox', { name: 'Type' }));
      await user.click(form.getByRole('option', { name: 'Hat' }));
      await user.click(screen.getByRole('button', { name: 'Save changes' }));

      expect(
        within(findCard('Socks for Dad')).getByText('1 of 1'),
      ).toBeInTheDocument();
    });
  });
});
