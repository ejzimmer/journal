import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { hugo } from './testMedia';
import { WatchedVideoForm } from './WatchedVideoForm';

const renderForm = () => {
  const closeModal = jest.fn();
  return {
    user: userEvent.setup(),
    closeModal,
    ...renderWithLanguageMediaStorage(
      <ModalContext.Provider value={{ closeModal }}>
        <WatchedVideoForm channel={hugo} />
      </ModalContext.Provider>,
    ),
  };
};

describe('WatchedVideoForm', () => {
  it('is titled with the channel name', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { name: 'HugoDécrypte' }),
    ).toBeInTheDocument();
  });

  describe('clicking save', () => {
    describe('with everything filled in', () => {
      it('adds the video as watched to the end', async () => {
        const { user, storageContext } = renderForm();

        await user.type(
          screen.getByRole('textbox', { name: 'URL' }),
          'https://youtu.be/3',
        );
        await user.click(screen.getByRole('button', { name: 'Add a lookup' }));
        await user.click(screen.getByRole('button', { name: 'Add a lookup' }));
        await user.click(
          screen.getByRole('button', { name: 'Add an AI question' }),
        );
        await user.type(screen.getByRole('textbox', { name: 'Minutes' }), '24');
        await user.type(screen.getByRole('textbox', { name: 'Seconds' }), '30');
        fireEvent.change(screen.getByRole('slider', { name: 'Understood' }), {
          target: { value: '70' },
        });
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['hugo', 'videos'],
          {
            url: 'https://youtu.be/3',
            lengthInSeconds: 1470,
            upToInSeconds: 1470,
            status: 'done',
            lookups: 2,
            aiQuestions: 1,
            understood: 70,
          },
        );
      });

      it('closes the form', async () => {
        const { user, closeModal } = renderForm();

        await user.type(
          screen.getByRole('textbox', { name: 'URL' }),
          'https://youtu.be/3',
        );
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(closeModal).toHaveBeenCalled();
      });
    });

    describe('without a URL', () => {
      it('does not add the video', async () => {
        const { user, storageContext } = renderForm();

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(storageContext.addItem).not.toHaveBeenCalled();
      });
    });

    describe('when understood was never set', () => {
      it('leaves it unset', async () => {
        const { user, storageContext } = renderForm();

        await user.type(
          screen.getByRole('textbox', { name: 'URL' }),
          'https://youtu.be/3',
        );
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(storageContext.addItem).toHaveBeenCalledWith(
          ['hugo', 'videos'],
          expect.objectContaining({ understood: undefined }),
        );
      });
    });
  });
});
