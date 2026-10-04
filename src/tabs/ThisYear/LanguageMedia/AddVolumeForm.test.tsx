import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddVolumeForm } from './AddVolumeForm';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { yotsuba } from './testMedia';
import { PrintSeries } from './types';

const miserables: PrintSeries = {
  id: 'miserables',
  type: 'book',
  name: 'Les Misérables',
  language: 'french',
  volumes: {},
};

const renderForm = (series: PrintSeries) => ({
  user: userEvent.setup(),
  ...renderWithLanguageMediaStorage(<AddVolumeForm series={series} />),
});

const openForm = async (
  user: ReturnType<typeof userEvent.setup>,
  series: PrintSeries,
) => {
  await user.click(
    screen.getByRole('button', { name: `Add a volume to ${series.name}` }),
  );
  return screen.getByRole('form', { name: 'Add volume' });
};

describe('AddVolumeForm', () => {
  describe('for manga', () => {
    describe('with pages', () => {
      it('adds the next volume to the series', async () => {
        const { user, storageContext } = renderForm(yotsuba);
        await openForm(user, yotsuba);

        await user.type(
          screen.getByRole('spinbutton', { name: 'Pages' }),
          '200',
        );
        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['yotsuba', 'volumes'],
          { number: 3, pages: 200, lookups: 0, aiQuestions: 0 },
        );
      });

      it('closes the form', async () => {
        const { user } = renderForm(yotsuba);
        const form = await openForm(user, yotsuba);

        await user.type(
          screen.getByRole('spinbutton', { name: 'Pages' }),
          '200',
        );
        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(form).not.toBeInTheDocument();
      });
    });

    describe('without pages', () => {
      it('does not add the volume', async () => {
        const { user, storageContext } = renderForm(yotsuba);
        await openForm(user, yotsuba);

        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(storageContext.addItem).not.toHaveBeenCalled();
      });
    });
  });

  describe('for books', () => {
    describe('with a name and pages', () => {
      it('adds the volume with its name', async () => {
        const { user, storageContext } = renderForm(miserables);
        await openForm(user, miserables);

        await user.type(
          screen.getByRole('textbox', { name: 'Name' }),
          'Fantine',
        );
        await user.type(
          screen.getByRole('spinbutton', { name: 'Pages' }),
          '480',
        );
        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['miserables', 'volumes'],
          {
            number: 1,
            name: 'Fantine',
            pages: 480,
            lookups: 0,
            aiQuestions: 0,
          },
        );
      });
    });

    describe('without a name', () => {
      it('does not add the volume', async () => {
        const { user, storageContext } = renderForm(miserables);
        await openForm(user, miserables);

        await user.type(
          screen.getByRole('spinbutton', { name: 'Pages' }),
          '480',
        );
        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(storageContext.addItem).not.toHaveBeenCalled();
      });
    });
  });
});
