import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { ProgressUpdateForm } from './ProgressUpdateForm';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { yotsuba } from './testMedia';
import { PrintSeries, Reading, Volume } from './types';

const volume = yotsuba.volumes!.vol1;

const READINGS_PATH = ['yotsuba', 'volumes', 'vol1', 'readings'];

const renderForm = (series: PrintSeries = yotsuba) => {
  const closeModal = jest.fn();
  const renderVolume = (volumeNow: Volume) => (
    <ModalContext.Provider value={{ closeModal }}>
      <ProgressUpdateForm series={series} volume={volumeNow} />
    </ModalContext.Provider>
  );
  const rendered = renderWithLanguageMediaStorage(
    renderVolume(series.volumes!.vol1),
    { addItem: jest.fn().mockReturnValue('new') },
  );
  return {
    user: userEvent.setup(),
    closeModal,
    ...rendered,
    rerenderWithReading: (reading: Partial<Reading>) =>
      rendered.rerender(
        renderVolume({
          ...volume,
          readings: {
            ...volume.readings,
            new: {
              id: 'new',
              createdAt: '2026-10-15T09:00:00Z',
              lookups: 0,
              aiQuestions: 0,
              ...reading,
            },
          },
        }),
      ),
  };
};

describe('ProgressUpdateForm', () => {
  describe('the title', () => {
    describe('for an unnamed volume', () => {
      it('shows the series and volume number', () => {
        renderForm();

        expect(
          screen.getByRole('heading', { name: 'よつばと！ 1' }),
        ).toBeInTheDocument();
      });
    });

    describe('for a named volume', () => {
      it('adds the volume name', () => {
        renderForm({
          ...yotsuba,
          volumes: { vol1: { ...volume, name: 'Cosette' } },
        });

        expect(
          screen.getByRole('heading', { name: 'よつばと！ 1: Cosette' }),
        ).toBeInTheDocument();
      });
    });
  });

  describe('the counters', () => {
    it('start at zero, whatever earlier readings recorded', () => {
      renderForm();

      expect(screen.getByRole('spinbutton', { name: 'Looked up' })).toHaveValue(
        0,
      );
      expect(screen.getByRole('spinbutton', { name: 'Asked AI' })).toHaveValue(
        0,
      );
    });
  });

  describe('adding one lookup', () => {
    describe('before anything else is saved', () => {
      it('starts a reading with one lookup, at the page I am up to', async () => {
        const { user, storageContext } = renderForm();

        await user.click(
          screen.getByRole('button', { name: 'Add a lookup to Volume 1' }),
        );

        expect(storageContext.addItem).toHaveBeenCalledWith(READINGS_PATH, {
          lookups: 1,
          aiQuestions: 0,
          page: 41,
        });
      });
    });

    describe('once the reading is started', () => {
      it('adds the lookup to that reading', async () => {
        const { user, storageContext, rerenderWithReading } = renderForm();
        const addLookup = screen.getByRole('button', {
          name: 'Add a lookup to Volume 1',
        });

        await user.click(addLookup);
        rerenderWithReading({ lookups: 1 });
        await user.click(addLookup);

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          [...READINGS_PATH, 'new'],
          { lookups: 2 },
        );
      });
    });

    it('keeps the form open', async () => {
      const { user, closeModal } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Add a lookup to Volume 1' }),
      );

      expect(closeModal).not.toHaveBeenCalled();
    });
  });

  describe('adding one AI question', () => {
    it('starts a reading with one AI question', async () => {
      const { user, storageContext } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Add an AI question to Volume 1' }),
      );

      expect(storageContext.addItem).toHaveBeenCalledWith(READINGS_PATH, {
        lookups: 0,
        aiQuestions: 1,
        page: 41,
      });
    });
  });

  describe('clicking save', () => {
    describe('after moving the understood slider', () => {
      it('saves a reading of how much I understood', async () => {
        const { user, storageContext } = renderForm();

        fireEvent.change(screen.getByRole('slider', { name: 'Understood' }), {
          target: { value: '85' },
        });
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(READINGS_PATH, {
          lookups: 0,
          aiQuestions: 0,
          understood: 85,
          page: 41,
        });
      });
    });

    describe('after adding a lookup', () => {
      it('finishes that reading', async () => {
        const { user, storageContext, rerenderWithReading } = renderForm();

        await user.click(
          screen.getByRole('button', { name: 'Add a lookup to Volume 1' }),
        );
        rerenderWithReading({ lookups: 1 });
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(storageContext.updateItem).toHaveBeenCalledWith(
          [...READINGS_PATH, 'new'],
          { lookups: 1, aiQuestions: 0, understood: undefined, page: 41 },
        );
      });
    });

    describe('with nothing recorded', () => {
      it('saves no reading', async () => {
        const { user, storageContext } = renderForm();

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(storageContext.addItem).not.toHaveBeenCalled();
      });
    });

    it('closes the form', async () => {
      const { user, closeModal } = renderForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(closeModal).toHaveBeenCalled();
    });
  });

  describe('pressing enter in a field', () => {
    it('saves the reading', async () => {
      const { user, storageContext } = renderForm();
      const askedAi = screen.getByRole('spinbutton', { name: 'Asked AI' });

      await user.clear(askedAi);
      await user.type(askedAi, '5{Enter}');

      expect(storageContext.addItem).toHaveBeenCalledWith(READINGS_PATH, {
        lookups: 0,
        aiQuestions: 5,
        page: 41,
      });
    });

    describe('with a page', () => {
      const typePage = async () => {
        const rendered = renderForm();
        const page = screen.getByRole('spinbutton', { name: 'Page' });
        await rendered.user.clear(page);
        await rendered.user.type(page, '60{Enter}');
        return rendered;
      };

      it('saves where I am up to', async () => {
        const { storageContext } = await typePage();

        expect(storageContext.updateItem).toHaveBeenCalledWith(['yotsuba'], {
          upTo: { volume: 1, page: 60 },
        });
      });
    });

    it('closes the form', async () => {
      const { user, closeModal } = renderForm();

      await user.type(
        screen.getByRole('spinbutton', { name: 'Looked up' }),
        '{Enter}',
      );

      expect(closeModal).toHaveBeenCalled();
    });
  });
});
