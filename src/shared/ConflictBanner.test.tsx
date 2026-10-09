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
};
const deletedTask = {
  path: 'v2/projects/0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60',
  mine: { id: '0b6e2f4c-1a2b-4c3d-8e9f-0a1b2c3d4e60', description: 'Fix gate' },
  theirs: null,
};

async function openReview() {
  await userEvent.click(screen.getByRole('button', { name: 'Review' }));
}

describe('ConflictBanner', () => {
  describe('with one clash', () => {
    it('says one change clashed', () => {
      renderBanner([descriptionClash]);

      expect(screen.getByRole('alert')).toHaveTextContent(
        '1 change clashed with another device.',
      );
    });
  });

  describe('with several clashes', () => {
    it('counts them', () => {
      renderBanner([descriptionClash, deletedTask]);

      expect(screen.getByRole('alert')).toHaveTextContent(
        '2 changes clashed with another device.',
      );
    });
  });

  describe('when reviewing', () => {
    it('shows both versions of each clash', async () => {
      renderBanner([descriptionClash]);

      await openReview();

      const choice = screen.getByRole('listitem', {
        name: 'work › description',
      });
      expect(choice).toHaveTextContent('YoursEmail Sam');
      expect(choice).toHaveTextContent('Other deviceEmail Sam about the venue');
    });

    describe('an item deleted on the other device', () => {
      it('names the item and says it was deleted', async () => {
        renderBanner([deletedTask]);

        await openReview();

        const choice = screen.getByRole('listitem', { name: 'projects' });
        expect(choice).toHaveTextContent('YoursFix gate');
        expect(choice).toHaveTextContent('Other deviceDeleted');
      });
    });

    it('keeps mine when asked', async () => {
      const { keepMine } = renderBanner([descriptionClash]);
      await openReview();

      await userEvent.click(screen.getByRole('button', { name: 'Keep mine' }));

      expect(keepMine).toHaveBeenCalledWith(descriptionClash.path);
    });

    it("keeps the other device's when asked", async () => {
      const { keepTheirs } = renderBanner([descriptionClash]);
      await openReview();

      await userEvent.click(
        screen.getByRole('button', { name: "Keep other device's" }),
      );

      expect(keepTheirs).toHaveBeenCalledWith(descriptionClash.path);
    });
  });

  describe('once every clash is resolved', () => {
    it('goes away', () => {
      const { resolveConflicts } = renderBanner([descriptionClash]);
      const banner = screen.getByRole('alert');

      resolveConflicts();

      expect(banner).not.toBeInTheDocument();
    });
  });
});
