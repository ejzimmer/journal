import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { MediaCactus } from './MediaCactus';
import { hugo } from './testMedia';

describe('MediaCactus', () => {
  describe('clicking the play sign', () => {
    it('opens a form to add a watched video', async () => {
      const user = userEvent.setup();
      renderWithLanguageMediaStorage(<MediaCactus channel={hugo} />);

      await user.click(
        screen.getByRole('button', { name: 'Add a watched video' }),
      );

      expect(
        screen.getByRole('form', {
          name: 'Add a watched video to HugoDécrypte',
        }),
      ).toBeInTheDocument();
    });

    describe('when the form is submitted', () => {
      it('closes the form', async () => {
        const user = userEvent.setup();
        renderWithLanguageMediaStorage(<MediaCactus channel={hugo} />);
        await user.click(
          screen.getByRole('button', { name: 'Add a watched video' }),
        );
        const form = screen.getByRole('form', {
          name: 'Add a watched video to HugoDécrypte',
        });

        await user.type(
          screen.getByRole('textbox', { name: 'URL' }),
          'https://youtu.be/3{Enter}',
        );

        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
