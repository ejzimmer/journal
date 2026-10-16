import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddAdventureForm } from './AddAdventureForm';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { Adventure, AdventureMode } from './types';

jest.mock('emoji-picker-react', () => ({
  __esModule: true,
  EmojiStyle: { NATIVE: 'native' },
  default: ({
    onEmojiClick,
  }: {
    onEmojiClick: (emoji: { emoji: string }) => void;
  }) => (
    <button type="button" onClick={() => onEmojiClick({ emoji: '🛶' })}>
      🛶
    </button>
  ),
}));

const running: AdventureMode = {
  id: 'running',
  name: 'Running',
  emoji: '🏃',
  colour: '#d11c2e',
};
const cycling: AdventureMode = {
  id: 'cycling',
  name: 'Cycling',
  emoji: '🚲',
  colour: '#2a9940',
};

async function openForm(
  modes: AdventureMode[] = [running, cycling],
  adventures: Adventure[] = [],
) {
  const user = userEvent.setup();
  const storage: AdventureStorageContextType = {
    adventures,
    modes,
    isLoading: false,
    addAdventure: jest.fn(),
    updateAdventure: jest.fn(),
    deleteAdventure: jest.fn(),
    addMode: jest.fn().mockReturnValue('kayaking'),
    updateMode: jest.fn(),
    deleteMode: jest.fn(),
  };
  const { rerender } = render(
    <AdventureStorageContext.Provider value={storage}>
      <AddAdventureForm />
    </AdventureStorageContext.Provider>,
  );
  const replaceModes = (newModes: AdventureMode[]) =>
    rerender(
      <AdventureStorageContext.Provider value={{ ...storage, modes: newModes }}>
        <AddAdventureForm />
      </AdventureStorageContext.Provider>,
    );
  await user.click(screen.getByRole('button', { name: 'Add an adventure' }));
  return { user, storage, replaceModes };
}

describe('AddAdventureForm', () => {
  describe('when the pushpin is clicked', () => {
    it('selects the first mode', async () => {
      await openForm();

      expect(screen.getByRole('radio', { name: 'Running' })).toBeChecked();
    });
  });

  describe('when the form is submitted', () => {
    describe('with a mode selected', () => {
      it('adds the adventure with that mode', async () => {
        const { user, storage } = await openForm();

        await user.type(
          screen.getByRole('textbox', { name: 'Adventure' }),
          'Ride to Hurstbridge',
        );
        await user.click(screen.getByRole('radio', { name: 'Cycling' }));
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(storage.addAdventure).toHaveBeenCalledWith({
          description: 'Ride to Hurstbridge',
          modeId: 'cycling',
        });
      });

      it('closes the form', async () => {
        const { user } = await openForm();
        const description = screen.getByRole('textbox', { name: 'Adventure' });

        await user.type(description, 'Ride to Hurstbridge');
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(description).not.toBeVisible();
      });
    });

    describe('with no mode selected', () => {
      it('does not add the adventure', async () => {
        const { user, storage } = await openForm([]);

        await user.type(
          screen.getByRole('textbox', { name: 'Adventure' }),
          'Paddle the Yarra',
        );
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(storage.addAdventure).not.toHaveBeenCalled();
      });
    });

    describe('without a description', () => {
      it('does not add the adventure', async () => {
        const { user, storage } = await openForm();

        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(storage.addAdventure).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the new mode button is clicked', () => {
    it('opens the new mode form with a colour no other mode uses', async () => {
      const { user } = await openForm();

      await user.click(screen.getByRole('button', { name: 'New mode' }));

      expect(screen.getByRole('textbox', { name: 'Mode name' })).toBeVisible();
      expect(screen.getByRole('radio', { name: 'Orange' })).toBeChecked();
    });

    it('hides the new mode button', async () => {
      const { user } = await openForm();
      const newMode = screen.getByRole('button', { name: 'New mode' });

      await user.click(newMode);

      expect(newMode).not.toBeInTheDocument();
    });
  });

  describe('when a new mode is added', () => {
    async function addKayaking() {
      const form = await openForm();
      await form.user.click(screen.getByRole('button', { name: 'New mode' }));
      await form.user.type(
        screen.getByRole('textbox', { name: 'Mode name' }),
        'Kayaking',
      );
      await form.user.click(screen.getByRole('button', { name: 'Emoji' }));
      await form.user.click(screen.getByRole('button', { name: '🛶' }));
      await form.user.click(screen.getByRole('radio', { name: 'Yellow' }));
      return form;
    }

    it('saves the mode', async () => {
      const { user, storage } = await addKayaking();

      await user.click(screen.getByRole('button', { name: 'Add mode' }));

      expect(storage.addMode).toHaveBeenCalledWith({
        name: 'Kayaking',
        emoji: '🛶',
        colour: '#fad200',
      });
    });

    it('closes the new mode form', async () => {
      const { user } = await addKayaking();
      const modeName = screen.getByRole('textbox', { name: 'Mode name' });

      await user.click(screen.getByRole('button', { name: 'Add mode' }));

      expect(modeName).not.toBeInTheDocument();
    });

    it('selects the new mode for the adventure', async () => {
      const { user, storage } = await addKayaking();

      await user.click(screen.getByRole('button', { name: 'Add mode' }));
      await user.type(
        screen.getByRole('textbox', { name: 'Adventure' }),
        'Paddle the Yarra',
      );
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(storage.addAdventure).toHaveBeenCalledWith({
        description: 'Paddle the Yarra',
        modeId: 'kayaking',
      });
    });

    describe('by pressing Enter in the name', () => {
      it('saves the mode without adding the adventure', async () => {
        const { user, storage } = await addKayaking();
        await user.type(
          screen.getByRole('textbox', { name: 'Adventure' }),
          'Paddle the Yarra',
        );

        await user.type(
          screen.getByRole('textbox', { name: 'Mode name' }),
          '{Enter}',
        );

        expect(storage.addMode).toHaveBeenCalled();
        expect(storage.addAdventure).not.toHaveBeenCalled();
      });
    });

    describe('without a name', () => {
      it('does not save the mode', async () => {
        const { user, storage } = await openForm();

        await user.click(screen.getByRole('button', { name: 'New mode' }));
        await user.click(screen.getByRole('button', { name: 'Add mode' }));

        expect(storage.addMode).not.toHaveBeenCalled();
      });
    });
  });

  describe("when a mode's edit button is clicked", () => {
    it('replaces the new mode button with the mode form, filled in with that mode', async () => {
      const { user } = await openForm();
      const newMode = screen.getByRole('button', { name: 'New mode' });

      await user.click(screen.getByRole('button', { name: 'Edit Cycling' }));

      expect(newMode).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Mode name' })).toHaveValue(
        'Cycling',
      );
      expect(screen.getByRole('button', { name: 'Emoji' })).toHaveTextContent(
        '🚲',
      );
      expect(screen.getByRole('radio', { name: 'Green' })).toBeChecked();
    });
  });

  describe('when an edited mode is saved', () => {
    it('updates the mode and closes the mode form', async () => {
      const { user, storage } = await openForm();
      await user.click(screen.getByRole('button', { name: 'Edit Cycling' }));
      const modeName = screen.getByRole('textbox', { name: 'Mode name' });
      await user.clear(modeName);
      await user.type(modeName, 'Riding');
      await user.click(screen.getByRole('radio', { name: 'Blue' }));

      await user.click(screen.getByRole('button', { name: 'Save mode' }));

      expect(storage.updateMode).toHaveBeenCalledWith({
        ...cycling,
        name: 'Riding',
        colour: '#4baae3',
      });
      expect(modeName).not.toBeInTheDocument();
    });
  });

  describe('deleting a mode', () => {
    it('shows the delete button on unused modes', async () => {
      await openForm(
        [running, cycling],
        [
          {
            id: 'parkrun',
            description: 'Plenty Gorge parkrun',
            modeId: 'running',
            isDone: false,
          },
        ],
      );

      expect(
        screen
          .getAllByRole('button', { name: /^Delete/ })
          .map((button) => button.getAttribute('aria-label')),
      ).toEqual(['Delete Cycling']);
    });

    describe('when the bin is clicked', () => {
      it('asks for confirmation, then deletes the mode when clicked again', async () => {
        const { user, storage } = await openForm();

        await user.click(
          screen.getByRole('button', { name: 'Delete Cycling' }),
        );
        expect(storage.deleteMode).not.toHaveBeenCalled();

        await user.click(
          screen.getByRole('button', { name: 'Confirm delete Cycling' }),
        );
        expect(storage.deleteMode).toHaveBeenCalledWith(cycling);
      });
    });

    describe('when it is being edited', () => {
      it('closes the mode form', async () => {
        const { user } = await openForm();
        await user.click(screen.getByRole('button', { name: 'Edit Cycling' }));
        const modeName = screen.getByRole('textbox', { name: 'Mode name' });

        await user.click(
          screen.getByRole('button', { name: 'Delete Cycling' }),
        );
        await user.click(
          screen.getByRole('button', { name: 'Confirm delete Cycling' }),
        );

        expect(modeName).not.toBeInTheDocument();
      });
    });
  });

  describe('when the selected mode is deleted', () => {
    it('selects another mode', async () => {
      const { user, storage, replaceModes } = await openForm();
      await user.type(
        screen.getByRole('textbox', { name: 'Adventure' }),
        'Ride to Hurstbridge',
      );
      await user.click(screen.getByRole('radio', { name: 'Cycling' }));

      await user.click(screen.getByRole('button', { name: 'Delete Cycling' }));
      await user.click(
        screen.getByRole('button', { name: 'Confirm delete Cycling' }),
      );
      replaceModes([running]);
      await user.click(screen.getByRole('button', { name: 'Add' }));

      expect(storage.addAdventure).toHaveBeenCalledWith({
        description: 'Ride to Hurstbridge',
        modeId: 'running',
      });
    });
  });

  describe('when there are no modes yet', () => {
    it('starts with the new mode form open', async () => {
      await openForm([]);

      expect(screen.getByRole('textbox', { name: 'Mode name' })).toBeVisible();
    });
  });

  describe('when the form is closed and opened again', () => {
    it('starts empty', async () => {
      const { user } = await openForm();

      await user.type(
        screen.getByRole('textbox', { name: 'Adventure' }),
        'Ride to Hurstbridge',
      );
      await user.click(screen.getByRole('button', { name: 'close modal' }));
      await user.click(
        screen.getByRole('button', { name: 'Add an adventure' }),
      );

      expect(screen.getByRole('textbox', { name: 'Adventure' })).toHaveValue(
        '',
      );
    });
  });
});
