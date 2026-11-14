import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YarnTrackingForm } from './Form';
import { renderWithYarnStorage } from './yarnStorageTestUtils';

async function openForm() {
  const user = userEvent.setup();
  const view = renderWithYarnStorage(<YarnTrackingForm />);
  await user.click(screen.getByRole('button', { name: 'Update yarn' }));
  return { user, ...view };
}

describe('YarnTrackingForm', () => {
  describe('when the update yarn button is clicked', () => {
    it('opens the form', async () => {
      await openForm();

      expect(screen.getByRole('combobox', { name: 'Yarn type' })).toBeVisible();
    });

    it('offers every yarn type', async () => {
      await openForm();

      expect(
        screen.getAllByRole('option').map((option) => option.textContent),
      ).toEqual(['wool', 'cotton', 'acrylic', 'sock yarn']);
    });
  });

  describe('when the form is submitted', () => {
    describe('with minus selected', () => {
      it('removes the yarn from the stash', async () => {
        const { user, storageContext } = await openForm();

        await user.selectOptions(
          screen.getByRole('combobox', { name: 'Yarn type' }),
          'cotton',
        );
        await user.type(screen.getByRole('textbox', { name: 'Grams' }), '150');
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(storageContext.removeYarn).toHaveBeenCalledWith('cotton', 150);
      });
    });

    describe('with plus selected', () => {
      it('adds the yarn to the stash', async () => {
        const { user, storageContext } = await openForm();

        await user.click(screen.getByRole('radio', { name: '+' }));
        await user.type(screen.getByRole('textbox', { name: 'Grams' }), '400');
        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(storageContext.addYarn).toHaveBeenCalledWith('wool', 400);
      });
    });

    it('closes the form', async () => {
      const { user } = await openForm();
      const yarnType = screen.getByRole('combobox', { name: 'Yarn type' });

      await user.type(screen.getByRole('textbox', { name: 'Grams' }), '400');
      await user.click(screen.getByRole('button', { name: 'Submit' }));

      expect(yarnType).not.toBeVisible();
    });

    describe('without an amount', () => {
      it('does not update the stash', async () => {
        const { user, storageContext } = await openForm();

        await user.click(screen.getByRole('button', { name: 'Submit' }));

        expect(storageContext.removeYarn).not.toHaveBeenCalled();
        expect(storageContext.addYarn).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the close button is clicked', () => {
    it('closes the form', async () => {
      const { user } = await openForm();
      const yarnType = screen.getByRole('combobox', { name: 'Yarn type' });

      await user.click(screen.getByRole('button', { name: 'Close' }));

      expect(yarnType).not.toBeVisible();
    });
  });
});
