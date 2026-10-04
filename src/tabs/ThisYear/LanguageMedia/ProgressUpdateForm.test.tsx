import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressUpdateForm } from './ProgressUpdateForm';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { yotsuba } from './testMedia';

const volume = yotsuba.volumes!.vol1;

const renderForm = () => {
  const onSubmit = jest.fn();
  return {
    user: userEvent.setup(),
    onSubmit,
    ...renderWithLanguageMediaStorage(
      <ProgressUpdateForm
        series={yotsuba}
        volume={volume}
        onSubmit={onSubmit}
      />,
    ),
  };
};

describe('ProgressUpdateForm', () => {
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
      const { user, onSubmit } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Add a lookup to Volume 1' }),
      );

      expect(onSubmit).not.toHaveBeenCalled();
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
      const { user, onSubmit } = renderForm();

      await user.type(
        screen.getByRole('spinbutton', { name: 'Looked up' }),
        '{Enter}',
      );

      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
