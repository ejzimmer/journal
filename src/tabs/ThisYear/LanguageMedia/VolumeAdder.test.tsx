import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { yotsuba } from './testMedia';
import { VolumeAdder } from './VolumeAdder';

describe('VolumeAdder', () => {
  describe('clicking the plus', () => {
    it('opens the form to add a volume', async () => {
      const user = userEvent.setup();
      renderWithLanguageMediaStorage(<VolumeAdder series={yotsuba} />);

      await user.click(
        screen.getByRole('button', { name: 'Add a volume to よつばと！' }),
      );

      expect(
        screen.getByRole('form', { name: 'Add volume' }),
      ).toBeInTheDocument();
    });

    describe('when the form is submitted', () => {
      it('closes the form', async () => {
        const user = userEvent.setup();
        renderWithLanguageMediaStorage(<VolumeAdder series={yotsuba} />);
        await user.click(
          screen.getByRole('button', { name: 'Add a volume to よつばと！' }),
        );
        const form = screen.getByRole('form', { name: 'Add volume' });

        await user.type(
          screen.getByRole('spinbutton', { name: 'Pages' }),
          '200{Enter}',
        );

        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
