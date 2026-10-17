import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { DeleteMediaButton } from './DeleteMediaButton';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { PrintSeries } from './types';

const miserables: PrintSeries = {
  id: 'miserables',
  type: 'book',
  name: 'Les Misérables',
  language: 'french',
  volumes: {},
};

const renderButton = () => {
  const closeModal = jest.fn();
  return {
    user: userEvent.setup(),
    closeModal,
    ...renderWithLanguageMediaStorage(
      <ModalContext.Provider value={{ closeModal }}>
        <DeleteMediaButton media={miserables} />
      </ModalContext.Provider>,
    ),
  };
};

const deleteMedia = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    screen.getByRole('button', { name: 'Delete Les Misérables' }),
  );
  await user.click(screen.getByRole('button', { name: 'Confirm delete' }));
};

describe('DeleteMediaButton', () => {
  describe('when the delete is confirmed', () => {
    it('deletes the media', async () => {
      const { user, storageContext } = renderButton();

      await deleteMedia(user);

      expect(storageContext.deleteItem).toHaveBeenCalledWith(['miserables']);
    });

    it('closes the form', async () => {
      const { user, closeModal } = renderButton();

      await deleteMedia(user);

      expect(closeModal).toHaveBeenCalled();
    });
  });
});
