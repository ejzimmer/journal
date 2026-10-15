import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { MediaCactus } from './MediaCactus';
import { hugo } from './testMedia';

describe('MediaCactus', () => {
  describe('clicking the signpost', () => {
    it('opens a form to track the current video', async () => {
      const user = userEvent.setup();
      renderWithLanguageMediaStorage(<MediaCactus channel={hugo} />);

      await user.click(screen.getByRole('button', { name: 'HugoDécrypte' }));

      expect(
        screen.getByRole('form', { name: 'Track Video 1' }),
      ).toBeInTheDocument();
    });

    describe('when the form is submitted', () => {
      it('closes the form', async () => {
        const user = userEvent.setup();
        renderWithLanguageMediaStorage(<MediaCactus channel={hugo} />);
        await user.click(screen.getByRole('button', { name: 'HugoDécrypte' }));
        const form = screen.getByRole('form', { name: 'Track Video 1' });

        await user.type(
          screen.getByRole('spinbutton', { name: 'Looked up' }),
          '{Enter}',
        );

        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
