import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddMediaSeedling } from './AddMediaSeedling';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';

describe('AddMediaSeedling', () => {
  describe('clicking the seedling', () => {
    it('opens the form to add media', async () => {
      const user = userEvent.setup();
      renderWithLanguageMediaStorage(<AddMediaSeedling />);

      await user.click(screen.getByRole('button', { name: 'Add media' }));

      expect(
        screen.getByRole('form', { name: 'Add media' }),
      ).toBeInTheDocument();
    });

    describe('when the form is submitted', () => {
      it('closes the form', async () => {
        const user = userEvent.setup();
        renderWithLanguageMediaStorage(<AddMediaSeedling />);
        await user.click(screen.getByRole('button', { name: 'Add media' }));
        const form = screen.getByRole('form', { name: 'Add media' });

        await user.type(
          screen.getByRole('textbox', { name: 'Name' }),
          'Lupin{Enter}',
        );

        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
