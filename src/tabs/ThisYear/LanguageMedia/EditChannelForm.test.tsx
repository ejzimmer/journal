import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { EditChannelForm } from './EditChannelForm';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { YoutubeChannel } from './types';

const hugo: YoutubeChannel = {
  id: 'hugo',
  type: 'youtube',
  name: 'HugoDécrypte',
  language: 'french',
  videos: {
    v1: {
      id: 'v1',
      url: 'https://youtu.be/1',
      lengthInSeconds: 3725,
      upToInSeconds: 1200,
      lookups: 0,
      aiQuestions: 0,
    },
    v2: {
      id: 'v2',
      url: 'https://youtu.be/2',
      lengthInSeconds: 600,
      upToInSeconds: 600,
      status: 'done',
      lookups: 0,
      aiQuestions: 0,
    },
  },
};

const renderForm = () => {
  const closeModal = jest.fn();
  return {
    user: userEvent.setup(),
    closeModal,
    ...renderWithLanguageMediaStorage(
      <ModalContext.Provider value={{ closeModal }}>
        <EditChannelForm channel={hugo} />
      </ModalContext.Provider>,
    ),
  };
};

const getLengthGroups = () => screen.getAllByRole('group', { name: 'Length' });

describe('EditChannelForm', () => {
  it('shows each video length in hours, minutes and seconds', () => {
    renderForm();
    const [firstLength] = getLengthGroups();

    expect(
      within(firstLength).getByRole('textbox', { name: 'Hours' }),
    ).toHaveValue('01');
    expect(
      within(firstLength).getByRole('textbox', { name: 'Minutes' }),
    ).toHaveValue('02');
    expect(
      within(firstLength).getByRole('textbox', { name: 'Seconds' }),
    ).toHaveValue('05');
  });

  describe('when saved', () => {
    it('saves the name and language', async () => {
      const { user, storageContext } = renderForm();

      await user.click(screen.getByRole('radio', { name: 'Japanese' }));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(storageContext.updateItem).toHaveBeenCalledWith(['hugo'], {
        name: 'HugoDécrypte',
        language: 'japanese',
      });
    });

    it('closes the form', async () => {
      const { user, closeModal } = renderForm();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(closeModal).toHaveBeenCalled();
    });

    describe('after changing a video', () => {
      describe('that is still being watched', () => {
        it('saves its link and length', async () => {
          const { user, storageContext } = renderForm();
          const [url] = screen.getAllByRole('textbox', { name: 'URL' });
          const minutes = within(getLengthGroups()[0]).getByRole('textbox', {
            name: 'Minutes',
          });

          await user.clear(url);
          await user.type(url, 'https://youtu.be/one');
          await user.clear(minutes);
          await user.type(minutes, '10');
          await user.click(screen.getByRole('button', { name: 'Save' }));

          expect(storageContext.updateItem).toHaveBeenCalledWith(
            ['hugo', 'videos', 'v1'],
            { url: 'https://youtu.be/one', lengthInSeconds: 4205 },
          );
        });
      });

      describe('that has been watched', () => {
        it('keeps it watched to the end of its new length', async () => {
          const { user, storageContext } = renderForm();
          const minutes = within(getLengthGroups()[1]).getByRole('textbox', {
            name: 'Minutes',
          });

          await user.clear(minutes);
          await user.type(minutes, '12');
          await user.click(screen.getByRole('button', { name: 'Save' }));

          expect(storageContext.updateItem).toHaveBeenCalledWith(
            ['hugo', 'videos', 'v2'],
            {
              url: 'https://youtu.be/2',
              lengthInSeconds: 720,
              upToInSeconds: 720,
            },
          );
        });
      });
    });
  });

  describe('when deleted', () => {
    it('deletes the channel and closes the form', async () => {
      const { user, storageContext, closeModal } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Delete HugoDécrypte' }),
      );
      await user.click(screen.getByRole('button', { name: 'Confirm delete' }));

      expect(storageContext.deleteItem).toHaveBeenCalledWith(['hugo']);
      expect(closeModal).toHaveBeenCalled();
    });
  });
});
