import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { ProgressUpdateForm } from './ProgressUpdateForm';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { yotsuba } from './testMedia';
import { PrintSeries } from './types';

const volume = yotsuba.volumes!.vol1;

const renderForm = (series: PrintSeries = yotsuba) => {
  const closeModal = jest.fn();
  return {
    user: userEvent.setup(),
    closeModal,
    ...renderWithLanguageMediaStorage(
      <ModalContext.Provider value={{ closeModal }}>
        <ProgressUpdateForm series={series} volume={series.volumes!.vol1} />
      </ModalContext.Provider>,
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

  describe('adding one lookup', () => {
    it('saves the new lookup count', async () => {
      const { user, storageContext } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Add a lookup to Volume 1' }),
      );

      expect(storageContext.updateItem).toHaveBeenCalledWith(
        ['yotsuba', 'volumes', 'vol1'],
        { lookups: 21 },
      );
    });

    it('keeps the form open', async () => {
      const { user, closeModal } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Add a lookup to Volume 1' }),
      );

      expect(closeModal).not.toHaveBeenCalled();
    });
  });

  describe('pressing enter in a field', () => {
    it('saves the totals', async () => {
      const { user, storageContext } = renderForm();
      const askedAi = screen.getByRole('spinbutton', { name: 'Asked AI' });

      await user.clear(askedAi);
      await user.type(askedAi, '5{Enter}');

      expect(storageContext.updateItem).toHaveBeenCalledWith(
        ['yotsuba', 'volumes', 'vol1'],
        { lookups: 20, aiQuestions: 5, understood: 60 },
      );
    });

    describe('with a page', () => {
      it('saves where I am up to', async () => {
        const { user, storageContext } = renderForm();
        const page = screen.getByRole('spinbutton', { name: 'Page' });

        await user.clear(page);
        await user.type(page, '60{Enter}');

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
