import { act, render, screen, within } from '@testing-library/react';
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
  mine: 'Email Sam about the venue deposit',
  theirs: 'Email Sam about the venue',
  item: {
    id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
    description: 'Email Sam',
  },
};
const statusClash = {
  path: 'v2/projects/0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e61/status',
  mine: 'paused',
  theirs: 'done',
  item: { id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e61', description: 'Fence' },
};
const deletedThere = {
  path: 'v2/projects/0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60',
  mine: { id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60', description: 'Fix gate' },
  theirs: null,
};
const deletedHere = {
  path: 'v2/projects/0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60',
  mine: null,
  theirs: {
    id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60',
    description: 'Fix gate',
  },
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
      renderBanner([descriptionClash, statusClash]);

      expect(screen.getByRole('alert')).toHaveTextContent(
        '2 conflicts while uploading',
      );
    });
  });

  describe('when resolving', () => {
    describe('a field where your change adds words', () => {
      it('highlights the added words', async () => {
        renderBanner([descriptionClash]);

        await openConflicts();

        const conflict = screen.getByRole('listitem', { name: 'Description' });
        expect(conflict).toHaveTextContent('Email Sam about the venue deposit');
        expect(within(conflict).getByText('deposit').tagName).toBe('INS');
      });
    });

    describe('a field where your change replaces the value', () => {
      it('strikes out theirs and highlights yours', async () => {
        renderBanner([statusClash]);

        await openConflicts();

        const conflict = screen.getByRole('listitem', {
          name: 'Fence · Status',
        });
        expect(within(conflict).getByText('done').tagName).toBe('DEL');
        expect(within(conflict).getByText('paused').tagName).toBe('INS');
      });
    });

    describe('an item deleted on the other device', () => {
      it('shows your copy of it as added and says it was deleted there', async () => {
        renderBanner([deletedThere]);

        await openConflicts();

        const conflict = screen.getByRole('listitem', { name: 'Projects' });
        expect(within(conflict).getByText('Fix gate').tagName).toBe('INS');
        expect(conflict).toHaveTextContent('Deleted on the other device');
      });
    });

    describe('an item deleted on this device', () => {
      it('strikes out their copy and says it was deleted here', async () => {
        renderBanner([deletedHere]);

        await openConflicts();

        const conflict = screen.getByRole('listitem', { name: 'Projects' });
        expect(within(conflict).getByText('Fix gate').tagName).toBe('DEL');
        expect(conflict).toHaveTextContent('Deleted on this device');
      });
    });

    it('keeps yours when asked', async () => {
      const { keepMine } = renderBanner([descriptionClash]);
      await openConflicts();

      await userEvent.click(screen.getByRole('button', { name: 'Keep yours' }));

      expect(keepMine).toHaveBeenCalledWith(descriptionClash.path);
    });

    it('keeps theirs when asked', async () => {
      const { keepTheirs } = renderBanner([descriptionClash]);
      await openConflicts();

      await userEvent.click(
        screen.getByRole('button', { name: 'Keep theirs' }),
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
