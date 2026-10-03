import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GardenVolumeAdder } from './GardenVolumeAdder';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { yotsuba } from './testMedia';

const renderAdder = () => ({
  user: userEvent.setup(),
  ...renderWithLanguageMediaStorage(<GardenVolumeAdder series={yotsuba} />),
});

const addVolume = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    screen.getByRole('button', { name: 'Add a volume to よつばと！' }),
  );
  await user.type(screen.getByRole('spinbutton', { name: 'Pages' }), '200');
  await user.click(screen.getByRole('button', { name: 'Add volume' }));
};

describe('GardenVolumeAdder', () => {
  describe('adding a volume', () => {
    it('adds the next volume to the series', async () => {
      const { user, storageContext } = renderAdder();

      await addVolume(user);

      expect(storageContext.addItem).toHaveBeenCalledWith(
        ['yotsuba', 'volumes'],
        { number: 3, pages: 200, lookups: 0, aiQuestions: 0 },
      );
    });

    it('closes the form', async () => {
      const { user } = renderAdder();
      await user.click(
        screen.getByRole('button', { name: 'Add a volume to よつばと！' }),
      );
      const form = screen.getByRole('form', { name: 'Add volume' });
      await user.type(screen.getByRole('spinbutton', { name: 'Pages' }), '200');

      await user.click(screen.getByRole('button', { name: 'Add volume' }));

      expect(form).not.toBeInTheDocument();
    });
  });
});
