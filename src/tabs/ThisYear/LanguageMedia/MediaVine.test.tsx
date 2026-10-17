import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { MediaVine } from './MediaVine';
import { lupin } from './testMedia';

describe('MediaVine', () => {
  it('names the vine after the series', () => {
    renderWithLanguageMediaStorage(<MediaVine series={lupin} />);

    expect(screen.getByRole('img', { name: 'Lupin' })).toBeInTheDocument();
  });

  it('puts up a signpost with the series name', () => {
    renderWithLanguageMediaStorage(<MediaVine series={lupin} />);

    expect(screen.getByText('Lupin')).toHaveClass('sign-board');
  });

  describe('clicking the update sign', () => {
    it('opens a form to track the current episode', async () => {
      const user = userEvent.setup();
      renderWithLanguageMediaStorage(<MediaVine series={lupin} />);

      await user.click(screen.getByRole('button', { name: 'Update' }));

      expect(
        screen.getByRole('form', { name: 'Track Lupin 1-2' }),
      ).toBeInTheDocument();
    });

    describe('when the form is submitted', () => {
      it('closes the form', async () => {
        const user = userEvent.setup();
        renderWithLanguageMediaStorage(<MediaVine series={lupin} />);
        await user.click(screen.getByRole('button', { name: 'Update' }));
        const form = screen.getByRole('form', { name: 'Track Lupin 1-2' });

        await user.type(
          screen.getByRole('spinbutton', { name: 'Looked up' }),
          '{Enter}',
        );

        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
