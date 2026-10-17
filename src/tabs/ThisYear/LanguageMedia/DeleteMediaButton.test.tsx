import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { DeleteMediaButton } from './DeleteMediaButton';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { PrintSeries } from './types';

jest.mock('../../../shared/controls/DeleteWithConfirmation', () => ({
  DeleteWithConfirmation: ({
    label,
    onDelete,
  }: {
    label: string;
    onDelete: () => void;
  }) => (
    <button type="button" onClick={onDelete}>
      {label}
    </button>
  ),
}));

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

describe('DeleteMediaButton', () => {
  describe('when deleted', () => {
    it('deletes the media', async () => {
      const { user, storageContext } = renderButton();

      await user.click(
        screen.getByRole('button', { name: 'Delete Les Misérables' }),
      );

      expect(storageContext.deleteItem).toHaveBeenCalledWith(['miserables']);
    });

    it('closes the form', async () => {
      const { user, closeModal } = renderButton();

      await user.click(
        screen.getByRole('button', { name: 'Delete Les Misérables' }),
      );

      expect(closeModal).toHaveBeenCalled();
    });
  });
});
