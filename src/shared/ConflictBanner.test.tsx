import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConflictBanner } from './ConflictBanner';
import { Conflict } from './localFirst/editTimes';

function renderBanner(initialConflicts: Conflict[]) {
  let conflicts = initialConflicts;
  const listeners = new Set<() => void>();
  const notify = () => act(() => listeners.forEach((onChange) => onChange()));
  const keepMine = jest.fn();
  const keepTheirs = jest.fn();
  render(
    <ConflictBanner
      conflictStatus={{
        subscribe: (onChange) => {
          listeners.add(onChange);
          return () => listeners.delete(onChange);
        },
        listConflicts: () => conflicts,
        keepMine,
        keepTheirs,
      }}
    />,
  );
  return {
    keepMine,
    keepTheirs,
    resolveConflicts: () => {
      conflicts = [];
      notify();
    },
  };
}

const descriptionClash = {
  path: 'v2/work/0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e5f/description',
  mine: 'Email Sam',
  theirs: 'Email Sam about the venue',
  item: {
    id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
    description: 'Email Sam',
  },
};
const deletedTask = {
  path: 'v2/projects/0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60',
  mine: { id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60', description: 'Fix gate' },
  theirs: null,
};

async function openConflicts() {
  await userEvent.click(screen.getByRole('button', { name: 'Resolve' }));
}

describe('ConflictBanner', () => {
  describe('with one conflict', () => {
    it('says there was a conflict while uploading', () => {
      renderBanner([descriptionClash]);

      expect(screen.getByRole('alert')).toHaveTextContent(
        '1 conflict while uploading',
      );
    });
  });

  describe('with several conflicts', () => {
    it('counts them', () => {
      renderBanner([descriptionClash, deletedTask]);

      expect(screen.getByRole('alert')).toHaveTextContent(
        '2 conflicts while uploading',
      );
    });
  });

  describe('when resolving', () => {
    describe('a field edited on both devices', () => {
      it('names the item and field and shows both changes', async () => {
        renderBanner([descriptionClash]);

        await openConflicts();

        const conflict = screen.getByRole('listitem', { name: 'Email Sam' });
        expect(conflict).toHaveTextContent('Description');
        expect(conflict).toHaveTextContent('Your changeKeep thisEmail Sam');
        expect(conflict).toHaveTextContent(
          'Incoming changeKeep thisEmail Sam about the venue',
        );
      });

      it('highlights the words that differ', async () => {
        renderBanner([descriptionClash]);

        await openConflicts();

        expect(screen.getByText('about the venue').tagName).toBe('MARK');
      });
    });

    describe('an item deleted on the other device', () => {
      it('shows it as edited here and deleted there', async () => {
        renderBanner([deletedTask]);

        await openConflicts();

        const conflict = screen.getByRole('listitem', { name: 'Fix gate' });
        expect(conflict).toHaveTextContent('Your changeKeep thisEdited');
        expect(conflict).toHaveTextContent('Incoming changeKeep thisDeleted');
      });
    });

    it('keeps your change when asked', async () => {
      const { keepMine } = renderBanner([descriptionClash]);
      await openConflicts();

      await userEvent.click(
        screen.getByRole('button', { name: 'Keep your change' }),
      );

      expect(keepMine).toHaveBeenCalledWith(descriptionClash.path);
    });

    it('keeps the incoming change when asked', async () => {
      const { keepTheirs } = renderBanner([descriptionClash]);
      await openConflicts();

      await userEvent.click(
        screen.getByRole('button', { name: 'Keep incoming change' }),
      );

      expect(keepTheirs).toHaveBeenCalledWith(descriptionClash.path);
    });
  });

  describe('once every conflict is resolved', () => {
    it('goes away', () => {
      const { resolveConflicts } = renderBanner([descriptionClash]);
      const banner = screen.getByRole('alert');

      resolveConflicts();

      expect(banner).not.toBeInTheDocument();
    });
  });
});
