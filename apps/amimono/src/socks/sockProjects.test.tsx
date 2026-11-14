import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { findCard, renderHomePage } from '../homePageTestUtils';

const createSeed = (project: Record<string, unknown>) => ({
  projects: { socks: { id: 'socks', name: 'Socks for Dad', ...project } },
  lists: { meetings: { socks: { id: 'socks', position: 1 } } },
});

async function expandCard() {
  const card = within(findCard('Socks for Dad'));
  await userEvent.click(card.getByRole('button', { name: 'Expand project' }));
  return card;
}

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

    it('counts knitted sections alongside the steps', () => {
      renderHomePage(seed);

      expect(
        within(findCard('Socks for Dad')).getByText('9 of 13'),
      ).toBeInTheDocument();
    });

    describe('knitting another section', () => {
      it('updates the progress on the card', async () => {
        renderHomePage(seed);
        const card = await expandCard();

        await userEvent.click(
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
      renderHomePage(createSeed({ type: 'socks' }));
      const card = await expandCard();

      expect(
        card
          .getAllByRole('slider')
          .map((sock) => sock.getAttribute('aria-valuenow')),
      ).toEqual(['0', '0']);
      expect(card.getByText('0 of 12')).toBeInTheDocument();
    });
  });

  describe('changing the type away from socks', () => {
    it('stops counting the sock sections', async () => {
      renderHomePage(
        createSeed({
          type: 'socks',
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
      const card = await expandCard();

      await userEvent.click(card.getByRole('button', { name: 'Edit project' }));
      await userEvent.click(screen.getByRole('button', { name: 'Hat' }));
      await userEvent.click(
        screen.getByRole('button', { name: 'Save changes' }),
      );

      expect(
        within(findCard('Socks for Dad')).getByText('1 of 1'),
      ).toBeInTheDocument();
    });
  });
});
