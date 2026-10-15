import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalContext } from '../../../shared/controls/Modal';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { hugo } from './testMedia';
import { Video } from './types';
import { VideoUpdateForm } from './VideoUpdateForm';

const renderForm = (video: Video = hugo.videos!.v1) => {
  const closeModal = jest.fn();
  return {
    user: userEvent.setup(),
    closeModal,
    ...renderWithLanguageMediaStorage(
      <ModalContext.Provider value={{ closeModal }}>
        <VideoUpdateForm channel={hugo} video={video} number={1} />
      </ModalContext.Provider>,
    ),
  };
};

describe('VideoUpdateForm', () => {
  it('is titled with the channel and video number', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { name: 'HugoDécrypte 1' }),
    ).toBeInTheDocument();
  });

  describe('adding one lookup', () => {
    it('saves the new lookup count', async () => {
      const { user, storageContext } = renderForm();

      await user.click(
        screen.getByRole('button', { name: 'Add a lookup to Video 1' }),
      );

      expect(storageContext.updateItem).toHaveBeenCalledWith(
        ['hugo', 'videos', 'v1'],
        { lookups: 8 },
      );
    });
  });

  describe('the time', () => {
    describe('for a video over an hour long', () => {
      it('shows hours, minutes and seconds', () => {
        renderForm();

        expect(screen.getByRole('textbox', { name: 'Hours' })).toHaveValue(
          '00',
        );
        expect(screen.getByRole('textbox', { name: 'Minutes' })).toHaveValue(
          '20',
        );
      });
    });

    describe('for a video under an hour long', () => {
      it('shows minutes and seconds', () => {
        renderForm({
          ...hugo.videos!.v1,
          lengthInSeconds: 1500,
          upToInSeconds: 95,
        });

        expect(
          screen
            .getAllByRole('textbox')
            .map((input) => input.getAttribute('aria-label')),
        ).toEqual(['Minutes', 'Seconds']);
      });
    });
  });

  describe('pressing enter in the time', () => {
    it('saves where I am up to with the totals', async () => {
      const { user, storageContext } = renderForm();
      const minutes = screen.getByRole('textbox', { name: 'Minutes' });

      await user.clear(minutes);
      await user.type(minutes, '45{Enter}');

      expect(storageContext.updateItem).toHaveBeenCalledWith(
        ['hugo', 'videos', 'v1'],
        {
          lookups: 7,
          aiQuestions: 1,
          understood: undefined,
          upToInSeconds: 2700,
        },
      );
    });

    it('closes the form', async () => {
      const { user, closeModal } = renderForm();

      await user.type(
        screen.getByRole('textbox', { name: 'Minutes' }),
        '{Enter}',
      );

      expect(closeModal).toHaveBeenCalled();
    });
  });

  describe('saving a video with no time', () => {
    it('saves only the totals', async () => {
      const { user, storageContext } = renderForm(hugo.videos!.v2);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(storageContext.updateItem).toHaveBeenCalledWith(
        ['hugo', 'videos', 'v2'],
        { lookups: 0, aiQuestions: 0, understood: undefined },
      );
    });
  });
});
