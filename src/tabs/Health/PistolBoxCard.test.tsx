import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { PistolBox } from '../../shared/types';
import { HealthStorageContext } from './HealthStorageContext';
import {
  createHealthStorageContext,
  renderWithHealthStorage,
} from './healthStorageTestUtils';
import { PistolBoxCard } from './PistolBoxCard';

function StoredPistolBox({ initial }: { initial: PistolBox }) {
  const [pistolBox, setPistolBox] = useState(initial);
  return (
    <HealthStorageContext.Provider
      value={createHealthStorageContext({ pistolBox, setPistolBox })}
    >
      <PistolBoxCard />
      <input aria-label="Notes" />
    </HealthStorageContext.Provider>
  );
}

describe('PistolBoxCard', () => {
  describe('before any box has been saved', () => {
    it('starts from three mats, a block on its side and a flat block', () => {
      renderWithHealthStorage(<PistolBoxCard />);

      expect(
        screen.getAllByRole('button', { name: 'Take mat off' }),
      ).toHaveLength(3);
      expect(
        screen.getByRole('button', { name: 'Lay block flat' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Take block off' }),
      ).toBeInTheDocument();
    });
  });

  describe('lowering the box', () => {
    it('turns a block on its end onto its side', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
        pistolBox: { mats: 1, blocks: ['end'] },
      });

      await user.click(
        screen.getByRole('button', { name: 'Turn block on its side' }),
      );

      expect(storageContext.setPistolBox).toHaveBeenCalledWith({
        mats: 1,
        blocks: ['side'],
      });
    });

    it('lays a block on its side flat', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
        pistolBox: { mats: 1, blocks: ['side', 'flat'] },
      });

      await user.click(screen.getByRole('button', { name: 'Lay block flat' }));

      expect(storageContext.setPistolBox).toHaveBeenCalledWith({
        mats: 1,
        blocks: ['flat', 'flat'],
      });
    });

    it('takes a flat block off the box', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
        pistolBox: { mats: 1, blocks: ['side', 'flat'] },
      });

      await user.click(screen.getByRole('button', { name: 'Take block off' }));

      expect(storageContext.setPistolBox).toHaveBeenCalledWith({
        mats: 1,
        blocks: ['side'],
      });
    });

    it('takes a mat off the box', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
        pistolBox: { mats: 2 },
      });

      await user.click(
        screen.getAllByRole('button', { name: 'Take mat off' })[0],
      );

      expect(storageContext.setPistolBox).toHaveBeenCalledWith({ mats: 1 });
    });
  });

  describe('when the whole box is gone', () => {
    it('shows that there is no box left', () => {
      renderWithHealthStorage(<PistolBoxCard />, {
        pistolBox: { mats: 0 },
      });

      expect(
        screen.getByRole('img', { name: 'No box left' }),
      ).toBeInTheDocument();
    });
  });

  describe('undoing', () => {
    it('puts the box back one change at a time with ctrl+z', async () => {
      const user = userEvent.setup();
      render(<StoredPistolBox initial={{ mats: 1, blocks: ['side'] }} />);

      await user.click(screen.getByRole('button', { name: 'Lay block flat' }));
      await user.click(screen.getByRole('button', { name: 'Take block off' }));
      const mat = screen.getByRole('button', { name: 'Take mat off' });
      await user.click(mat);
      expect(mat).not.toBeInTheDocument();

      await user.keyboard('{Control>}z{/Control}');
      expect(
        screen.getByRole('button', { name: 'Take mat off' }),
      ).toBeInTheDocument();

      await user.keyboard('{Control>}z{/Control}');
      await user.keyboard('{Control>}z{/Control}');
      expect(
        screen.getByRole('button', { name: 'Lay block flat' }),
      ).toBeInTheDocument();
    });

    it('puts the box back with cmd+z', async () => {
      const user = userEvent.setup();
      render(<StoredPistolBox initial={{ mats: 1, blocks: ['flat'] }} />);

      await user.click(screen.getByRole('button', { name: 'Take block off' }));
      await user.keyboard('{Meta>}z{/Meta}');

      expect(
        screen.getByRole('button', { name: 'Take block off' }),
      ).toBeInTheDocument();
    });

    describe('while typing in a text field', () => {
      it('leaves the box alone', async () => {
        const user = userEvent.setup();
        render(<StoredPistolBox initial={{ mats: 2 }} />);

        await user.click(
          screen.getAllByRole('button', { name: 'Take mat off' })[0],
        );
        await user.click(screen.getByRole('textbox', { name: 'Notes' }));
        await user.keyboard('{Control>}z{/Control}');

        expect(
          screen.getAllByRole('button', { name: 'Take mat off' }),
        ).toHaveLength(1);
      });
    });
  });
});
