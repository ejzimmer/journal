import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';

import { SockPlanner } from './SockPlanner';

const seed = {
  socks: {
    kelly: {
      id: 'kelly',
      name: 'Kelly',
      euSize: 38,
      overrides: { castOnStitches: 56 },
    },
    dad: { id: 'dad', name: 'Dad', euSize: 44 },
  },
};

function renderSockPlanner() {
  const user = userEvent.setup();
  render(
    <FirebaseContext.Provider value={createMockFirebaseContext(seed)}>
      <SockPlanner />
    </FirebaseContext.Provider>,
  );
  return { user };
}

function findRow(name: string) {
  const row = screen.getAllByRole('row').find(
    (tableRow) =>
      within(tableRow).queryByRole('textbox', { name: 'Name' }) &&
      within(tableRow).getByRole<HTMLInputElement>('textbox', {
        name: 'Name',
      }).value === name,
  );
  if (!row) throw new Error(`No row for ${name}`);
  return within(row);
}

function findNumberIn(name: string, label: string) {
  return findRow(name).getByRole<HTMLInputElement>('spinbutton', {
    name: label,
  });
}

function findSockNumbersFor(name: string) {
  return ['Length', 'Cast-on stitches', 'Start toe at'].map(
    (label) => findNumberIn(name, label).value,
  );
}

describe('SockPlanner', () => {
  describe('showing people', () => {
    it('lists them by name', () => {
      renderSockPlanner();

      expect(
        within(screen.getByRole('table'))
          .getAllByRole<HTMLInputElement>('textbox', { name: 'Name' })
          .map((input) => input.value),
      ).toEqual(['Dad', 'Kelly']);
    });

    it('works out their numbers from their size', () => {
      renderSockPlanner();

      expect(findSockNumbersFor('Dad')).toEqual(['273', '80', '241.7']);
    });

    it('shows overridden numbers in place of the default', () => {
      renderSockPlanner();

      expect(findNumberIn('Kelly', 'Cast-on stitches').value).toBe('56');
    });
  });

  describe('adding a person', () => {
    describe('with an EU size', () => {
      it('adds them with the numbers for that size', async () => {
        const { user } = renderSockPlanner();
        const form = within(screen.getByRole('form', { name: 'New person' }));

        await user.type(form.getByRole('textbox', { name: 'Name' }), 'Mum');
        await user.type(form.getByRole('spinbutton', { name: 'Size' }), '37');
        await user.click(form.getByRole('button', { name: 'Add person' }));

        expect(findSockNumbersFor('Mum')).toEqual(['230', '56', '203']);
      });
    });

    describe('with another sizing system', () => {
      it('converts the size to EU', async () => {
        const { user } = renderSockPlanner();
        const form = within(screen.getByRole('form', { name: 'New person' }));

        await user.type(form.getByRole('textbox', { name: 'Name' }), 'Terri');
        await user.type(form.getByRole('spinbutton', { name: 'Size' }), '7');
        await user.selectOptions(
          form.getByRole('combobox', { name: 'Sizing system' }),
          "US women's",
        );
        await user.click(form.getByRole('button', { name: 'Add person' }));

        expect(findNumberIn('Terri', 'Size').value).toBe('38');
      });
    });
  });

  describe('overriding a number', () => {
    it('keeps the new number', async () => {
      const { user } = renderSockPlanner();
      const length = findNumberIn('Dad', 'Length');

      await user.clear(length);
      await user.type(length, '279{Enter}');

      expect(findNumberIn('Dad', 'Length').value).toBe('279');
    });

    it('recalculates numbers that depend on it', async () => {
      const { user } = renderSockPlanner();
      const length = findNumberIn('Dad', 'Length');

      await user.clear(length);
      await user.type(length, '279{Enter}');

      expect(findNumberIn('Dad', 'Start toe at').value).toBe('247.1');
    });

    describe('then resetting it', () => {
      it('goes back to the default', async () => {
        const { user } = renderSockPlanner();

        await user.click(
          findRow('Kelly').getByRole('button', {
            name: 'Reset cast-on stitches for Kelly to 64',
          }),
        );

        expect(findNumberIn('Kelly', 'Cast-on stitches').value).toBe('64');
      });
    });
  });

  describe('changing a size', () => {
    it('recalculates the default numbers', async () => {
      const { user } = renderSockPlanner();
      const size = findNumberIn('Dad', 'Size');

      await user.clear(size);
      await user.type(size, '46{Enter}');

      expect(findSockNumbersFor('Dad')).toEqual(['282', '80', '249.8']);
    });
  });

  describe('deleting a person', () => {
    it('removes them once confirmed', async () => {
      const { user } = renderSockPlanner();
      const name = findRow('Dad').getByRole('textbox', { name: 'Name' });

      await user.click(
        findRow('Dad').getByRole('button', { name: 'Delete Dad' }),
      );
      await user.click(
        findRow('Dad').getByRole('button', { name: 'Confirm delete Dad' }),
      );

      expect(name).not.toBeInTheDocument();
    });
  });
});
