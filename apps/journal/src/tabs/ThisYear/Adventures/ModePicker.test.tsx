import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AdventureStorageContext,
  AdventureStorageContextType,
} from './AdventureStorageContext';
import { ModePicker } from './ModePicker';
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

const renderPicker = () => {
  const onChange = jest.fn();
  const storage: AdventureStorageContextType = {
    adventures: [],
    modes: [running, cycling],
    isLoading: false,
    addAdventure: jest.fn(),
    updateAdventure: jest.fn(),
    deleteAdventure: jest.fn(),
    addMode: jest.fn(),
    updateMode: jest.fn(),
    deleteMode: jest.fn(),
  };
  render(
    <AdventureStorageContext.Provider value={storage}>
      <ModePicker mode={running} onChange={onChange} />
      <button>Elsewhere</button>
    </AdventureStorageContext.Provider>,
  );
  return { onChange, user: userEvent.setup() };
};

describe('ModePicker', () => {
  it('shows the current mode', () => {
    renderPicker();

    expect(screen.getByRole('button', { name: 'Running' })).toHaveTextContent(
      '🏃',
    );
  });

  describe('when opened', () => {
    it('shows every mode', async () => {
      const { user } = renderPicker();

      await user.click(screen.getByRole('button', { name: 'Running' }));

      const choices = screen.getByRole('group', { name: 'Mode' });
      expect(choices).toHaveTextContent('🏃🚲');
    });

    it('focuses the current mode', async () => {
      const { user } = renderPicker();

      await user.click(screen.getByRole('button', { name: 'Running' }));

      expect(
        screen.getByRole('button', { name: 'Running', pressed: true }),
      ).toHaveFocus();
    });

    describe('and another mode is picked', () => {
      it('changes to that mode', async () => {
        const { onChange, user } = renderPicker();

        await user.click(screen.getByRole('button', { name: 'Running' }));
        await user.click(screen.getByRole('button', { name: 'Cycling' }));

        expect(onChange).toHaveBeenCalledWith('cycling');
      });

      it('closes and returns focus to the emoji', async () => {
        const { user } = renderPicker();

        await user.click(screen.getByRole('button', { name: 'Running' }));
        const choices = screen.getByRole('group', { name: 'Mode' });
        await user.click(screen.getByRole('button', { name: 'Cycling' }));

        expect(choices).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Running' })).toHaveFocus();
      });
    });

    describe('and the current mode is picked', () => {
      it('keeps the mode', async () => {
        const { onChange, user } = renderPicker();

        await user.click(screen.getByRole('button', { name: 'Running' }));
        await user.click(
          screen.getByRole('button', { name: 'Running', pressed: true }),
        );

        expect(onChange).not.toHaveBeenCalled();
      });
    });

    describe('and Escape is pressed', () => {
      it('closes and returns focus to the emoji', async () => {
        const { user } = renderPicker();

        await user.click(screen.getByRole('button', { name: 'Running' }));
        const choices = screen.getByRole('group', { name: 'Mode' });
        await user.keyboard('{Escape}');

        expect(choices).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Running' })).toHaveFocus();
      });
    });

    describe('and focus moves elsewhere', () => {
      it('closes', async () => {
        const { user } = renderPicker();

        await user.click(screen.getByRole('button', { name: 'Running' }));
        const choices = screen.getByRole('group', { name: 'Mode' });
        await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

        expect(choices).not.toBeInTheDocument();
      });
    });
  });
});
