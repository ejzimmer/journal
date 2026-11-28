import { within } from '@testing-library/react';

import { SubtaskGoal } from 'shared/dailyGoals/types';
import { findCard, renderHomePage } from '../homePageTestUtils';

const seed = {
  projects: {
    cardigan: {
      id: 'cardigan',
      description: 'Cardigan',
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
              photoUrl: 'https://images.example/mineral.jpg',
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
    priority: { cardigan: { id: 'cardigan', position: 1 } },
  },
};

describe('the project drawer', () => {
  describe('when a card is expanded', () => {
    it('lists the subtasks in order', async () => {
      const { user } = renderHomePage(seed);

      const card = within(findCard('Cardigan'));

      await user.click(card.getByRole('button', { name: 'Expand project' }));

      expect(
        within(card.getByRole('list', { name: 'Subtasks' }))
          .getAllByRole('listitem')
          .map((subtask) =>
            within(subtask)
              .getAllByRole('checkbox')[0]
              .getAttribute('aria-label'),
          ),
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
    it('shows the pattern, yarn with colourway photos, and gauge', async () => {
      const { user } = renderHomePage(seed);
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.click(card.getByRole('button', { name: 'Details' }));

      expect(
        card.getByRole('link', { name: 'Telja Cardigan' }),
      ).toHaveAttribute('href', 'https://example.com/telja');
      const mineral = card.getByTitle('Dye lot 0917');
      expect(mineral).toHaveTextContent('Mineral');
      expect(
        within(mineral)
          .getAllByRole('presentation')
          .map((image) => image.getAttribute('src')),
      ).toContain('https://images.example/mineral.jpg');
      expect(card.getByRole('img', { name: '1.5 skeins' })).toBeInTheDocument();
      expect(
        card.getByRole('img', {
          name: 'Gauge: 22 stitches and 30 rows per 10 cm',
        }),
      ).toBeInTheDocument();
      expect(card.getByText('4 mm')).toBeInTheDocument();
    });
  });

  describe('ticking off a subtask', () => {
    it('updates the progress on the card', async () => {
      const { user } = renderHomePage(seed);
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.click(card.getByRole('checkbox', { name: 'Sleeves' }));

      expect(card.getByRole('checkbox', { name: 'Sleeves' })).toBeChecked();
      expect(card.getByText('2 of 2')).toBeInTheDocument();
    });
  });

  describe('putting a subtask on today', () => {
    const seedWithGoals = (slots: Record<string, SubtaskGoal>) => ({
      ...seed,
      今日: { slots },
    });
    const createOtherGoal = (id: string, position: number): SubtaskGoal => ({
      id,
      position,
      projectPath: 'projects/shelves',
      subtaskPath: `projects/shelves/subtasks/${id}`,
    });
    const cardiganPath = 'amimono/projects/cardigan';

    async function expandCardigan(slots: Record<string, SubtaskGoal>) {
      const { user } = renderHomePage(seedWithGoals(slots));
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));
      const sleevesItem = within(card.getByRole('list', { name: 'Subtasks' }))
        .getAllByRole('listitem')
        .find((subtask) =>
          within(subtask).queryByRole('checkbox', { name: 'Sleeves' }),
        )!;
      const sleeves = within(sleevesItem);
      return { user, sleeves };
    }

    describe('when a Today slot is free', () => {
      it('ticks the link checkbox once the subtask is on today', async () => {
        const { user, sleeves } = await expandCardigan({
          paint: createOtherGoal('paint', 0),
        });
        const link = sleeves.getByRole('checkbox', { name: 'On today' });

        await user.click(link);

        expect(link).toBeChecked();
      });
    });

    describe('when every Today slot is full', () => {
      it('disables the link checkbox', async () => {
        const { sleeves } = await expandCardigan({
          paint: createOtherGoal('paint', 0),
          sand: createOtherGoal('sand', 1),
          drill: createOtherGoal('drill', 2),
        });

        expect(
          sleeves.getByRole('checkbox', { name: 'On today' }),
        ).toBeDisabled();
      });
    });

    describe('when the subtask is already on today', () => {
      it('takes it off today when the link checkbox is unticked', async () => {
        const { user, sleeves } = await expandCardigan({
          sleeves: {
            id: 'sleeves',
            position: 0,
            projectPath: cardiganPath,
            subtaskPath: `${cardiganPath}/subtasks/sleeves`,
          },
        });
        const link = sleeves.getByRole('checkbox', { name: 'On today' });
        expect(link).toBeChecked();

        await user.click(link);

        expect(link).not.toBeChecked();
      });
    });
  });

  describe('adding a subtask', () => {
    it('adds it to the end of the subtasks', async () => {
      const { user } = renderHomePage(seed);
      const card = within(findCard('Cardigan'));
      await user.click(card.getByRole('button', { name: 'Expand project' }));

      await user.type(
        card.getByRole('textbox', { name: 'New subtask' }),
        'Button band{Enter}',
      );

      expect(
        within(card.getByRole('list', { name: 'Subtasks' }))
          .getAllByRole('listitem')
          .map((subtask) =>
            within(subtask)
              .getAllByRole('checkbox')[0]
              .getAttribute('aria-label'),
          ),
      ).toEqual(['Swatch', 'Sleeves', 'Button band']);
    });
  });
});
