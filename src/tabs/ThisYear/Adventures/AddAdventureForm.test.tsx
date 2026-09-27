import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddAdventureForm } from './AddAdventureForm';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { AdventureMode } from './types';

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

async function openForm(modes: AdventureMode[] = [running, cycling]) {
  const user = userEvent.setup();
  const storage: AdventureStorageContextType = {
    adventures: [],
    modes,
    isLoading: false,
    addAdventure: jest.fn(),
    updateAdventure: jest.fn(),
    deleteAdventure: jest.fn(),
    addMode: jest.fn().mockReturnValue('kayaking'),
  };
  render(
    <AdventureStorageContext.Provider value={storage}>
      <AddAdventureForm />
    </AdventureStorageContext.Provider>,
  );
  await user.click(screen.getByRole('button', { name: 'Add an adventure' }));
  return { user, storage };
}

describe('AddAdventureForm', () => {
  describe('when the pushpin is clicked', () => {
    it('selects the first mode', async () => {
      await openForm();

      expect(screen.getByRole('radio', { name: 'Running' })).toBeChecked();
    });
  });

  describe('when the form is submitted', () => {
    describe('with an existing mode', () => {
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

    describe('with a new mode', () => {
      it('adds the mode', async () => {
        const { user, storage } = await openForm();

        await user.type(
          screen.getByRole('textbox', { name: 'Adventure' }),
          'Paddle the Yarra',
        );
        await user.click(screen.getByRole('radio', { name: 'New mode' }));
        await user.type(
          screen.getByRole('textbox', { name: 'Mode name' }),
          'Kayaking',
        );
        await user.click(screen.getByRole('button', { name: 'Emoji' }));
        await user.click(screen.getByRole('radio', { name: '🛶' }));
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(storage.addMode).toHaveBeenCalledWith({
          name: 'Kayaking',
          emoji: '🛶',
          colour: '#f9b20e',
        });
      });

      it('adds the adventure with the new mode', async () => {
        const { user, storage } = await openForm();

        await user.type(
          screen.getByRole('textbox', { name: 'Adventure' }),
          'Paddle the Yarra',
        );
        await user.click(screen.getByRole('radio', { name: 'New mode' }));
        await user.type(
          screen.getByRole('textbox', { name: 'Mode name' }),
          'Kayaking',
        );
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(storage.addAdventure).toHaveBeenCalledWith({
          description: 'Paddle the Yarra',
          modeId: 'kayaking',
        });
      });

      it('uses the colour that was picked', async () => {
        const { user, storage } = await openForm();

        await user.type(
          screen.getByRole('textbox', { name: 'Adventure' }),
          'Paddle the Yarra',
        );
        await user.click(screen.getByRole('radio', { name: 'New mode' }));
        await user.type(
          screen.getByRole('textbox', { name: 'Mode name' }),
          'Kayaking',
        );
        await user.click(screen.getByRole('radio', { name: 'Racecourse' }));
        await user.click(screen.getByRole('button', { name: 'Add' }));

        expect(storage.addMode).toHaveBeenCalledWith(
          expect.objectContaining({ colour: '#fad200' }),
        );
      });

      describe('without a name', () => {
        it('does not add the adventure', async () => {
          const { user, storage } = await openForm();

          await user.type(
            screen.getByRole('textbox', { name: 'Adventure' }),
            'Paddle the Yarra',
          );
          await user.click(screen.getByRole('radio', { name: 'New mode' }));
          await user.click(screen.getByRole('button', { name: 'Add' }));

          expect(storage.addMode).not.toHaveBeenCalled();
          expect(storage.addAdventure).not.toHaveBeenCalled();
        });
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

  describe('when there are no modes yet', () => {
    it('starts on a new mode', async () => {
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
