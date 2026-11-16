import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { findCard, renderHomePage } from '../homePageTestUtils';

const createSeed = (project: Record<string, unknown>) => ({
  projects: {
    socks: { id: 'socks', name: 'Socks for Dad', type: 'socks', ...project },
  },
  lists: { portable: { socks: { id: 'socks', position: 1 } } },
  socks: {
    dad: { id: 'dad', name: 'Dad', euSize: 44 },
    mum: { id: 'mum', name: 'Mum', euSize: 37 },
  },
});

async function expandCard(user: UserEvent) {
  const card = within(findCard('Socks for Dad'));
  await user.click(card.getByRole('button', { name: 'Expand project' }));
  return card;
}

describe('sock recipients', () => {
  describe('when a sock project is for someone', () => {
    it('marks their numbers on the sock picture', async () => {
      const { user } = renderHomePage(createSeed({ recipientId: 'dad' }));

      const card = await expandCard(user);

      expect(card.getByText('80 sts')).toBeInTheDocument();
      expect(card.getByText('273 mm')).toBeInTheDocument();
      expect(card.getByText('241.7 mm')).toBeInTheDocument();
    });

    describe('at the gauge of the project', () => {
      it('works out the cast-on for that gauge', async () => {
        const { user } = renderHomePage(
          createSeed({ recipientId: 'dad', gauge: { stitches: 28 } }),
        );

        const card = await expandCard(user);

        expect(card.getByText('72 sts')).toBeInTheDocument();
      });
    });

    describe('switching to toe up', () => {
      it('takes the cuff-down numbers off the picture', async () => {
        const { user } = renderHomePage(createSeed({ recipientId: 'dad' }));
        const card = await expandCard(user);
        const castOn = card.getByText('80 sts');

        await user.click(card.getByRole('radio', { name: 'Toe up' }));

        expect(castOn).not.toBeInTheDocument();
      });
    });
  });

  describe('choosing who a sock project is for', () => {
    it('marks their numbers on the sock picture', async () => {
      const { user } = renderHomePage(createSeed({}));
      const card = await expandCard(user);

      await user.click(card.getByRole('button', { name: 'Edit project' }));
      const form = within(screen.getByRole('form', { name: 'Edit project' }));
      await user.click(form.getByRole('combobox', { name: 'Recipient' }));
      await user.click(form.getByRole('option', { name: 'Mum' }));
      await user.click(form.getByRole('button', { name: 'Save changes' }));

      expect(
        within(findCard('Socks for Dad')).getByText('56 sts'),
      ).toBeInTheDocument();
    });

    describe('then clearing it', () => {
      it('shows the sock picture without numbers', async () => {
        const { user } = renderHomePage(createSeed({ recipientId: 'dad' }));
        const card = await expandCard(user);

        await user.click(card.getByRole('button', { name: 'Edit project' }));
        const form = within(screen.getByRole('form', { name: 'Edit project' }));
        await user.click(form.getByRole('button', { name: 'Clear recipient' }));
        await user.click(form.getByRole('button', { name: 'Save changes' }));

        const savedCard = findCard('Socks for Dad');
        expect(
          within(savedCard).getByRole('slider', { name: 'second sock' }),
        ).toBeInTheDocument();
        expect(savedCard).not.toHaveTextContent('80 sts');
      });
    });
  });
});
