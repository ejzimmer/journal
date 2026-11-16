import { within } from '@testing-library/react';

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
          colourways: {
            mineral: {
              id: 'mineral',
              name: 'Mineral',
              skeins: 1.5,
              dyeLot: '0917',
              position: 1,
            },
          },
          position: 1,
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
        sleeves: {
          id: 'sleeves',
          description: 'Sleeves',
          status: 'ready',
          position: 2,
        },
      },
    },
  },
  lists: {
    concentration: { cardigan: { id: 'cardigan', position: 1 } },
  },
};

describe('the project drawer', () => {
  describe('when a card is expanded', () => {
    it('lists the steps in order', async () => {
      const { user } = renderHomePage(seed);

      const card = within(findCard('Cardigan'));

      await user.click(card.getByRole('button', { name: 'Expand project' }));

      expect(
        within(card.getByRole('list', { name: 'Steps' }))
          .getAllByRole('listitem')
          .map((step) => step.textContent),
      ).toEqual(['Swatch', 'Sleeves']);
    });

    it('starts with the details closed', async () => {
      const { user } = renderHomePage(seed);

      const card = within(findCard('Cardigan'));

      await user.click(card.getByRole('button', { name: 'Expand project' }));

      expect(card.getByRole('button', { name: 'Details' })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });
  });

  describe('opening the details', () => {
    it('shows the pattern, yarn and gauge', async () => {
      const { user } = renderHomePage(seed);
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.click(card.getByRole('button', { name: 'Details' }));

      expect(
        card.getByRole('link', { name: 'Telja Cardigan' }),
      ).toHaveAttribute('href', 'https://example.com/telja');
      expect(card.getByTitle('Dye lot 0917')).toHaveTextContent('Mineral');
      expect(card.getByRole('img', { name: '1.5 skeins' })).toBeInTheDocument();
      expect(
        card.getByRole('img', {
          name: 'Gauge: 22 stitches and 30 rows per 10 cm',
        }),
      ).toBeInTheDocument();
      expect(card.getByText('4 mm')).toBeInTheDocument();
    });
  });

  describe('ticking off a step', () => {
    it('updates the progress on the card', async () => {
      const { user } = renderHomePage(seed);
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.click(card.getByRole('checkbox', { name: 'Sleeves' }));

      expect(card.getByRole('checkbox', { name: 'Sleeves' })).toBeChecked();
      expect(card.getByText('2 of 2')).toBeInTheDocument();
    });
  });

  describe('adding a step', () => {
    it('adds it to the end of the steps', async () => {
      const { user } = renderHomePage(seed);
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.type(
        card.getByRole('textbox', { name: 'New step' }),
        'Button band{Enter}',
      );

      expect(
        within(card.getByRole('list', { name: 'Steps' }))
          .getAllByRole('listitem')
          .map((step) => step.textContent),
      ).toEqual(['Swatch', 'Sleeves', 'Button band']);
    });
  });
});
