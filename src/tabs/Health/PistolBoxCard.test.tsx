import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { PistolBoxCard } from './PistolBoxCard';

describe('PistolBoxCard', () => {
  describe('lowering the box', () => {
    describe('before any level has been saved', () => {
      it('lowers from the starting level', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithHealthStorage(<PistolBoxCard />);

        await user.click(screen.getByRole('button', { name: 'Lower box' }));

        expect(storageContext.updatePistolBoxLevel).toHaveBeenCalledWith(5);
      });
    });

    describe('with a level saved', () => {
      it('lowers it by one', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
          pistolBoxLevel: 2,
        });

        await user.click(screen.getByRole('button', { name: 'Lower box' }));

        expect(storageContext.updatePistolBoxLevel).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('when the whole box is gone', () => {
    it('shows that there is no box left', () => {
      renderWithHealthStorage(<PistolBoxCard />, { pistolBoxLevel: 0 });

      expect(
        screen.getByRole('img', { name: 'No box left' }),
      ).toBeInTheDocument();
    });
  });

  describe('undoing', () => {
    it('raises the box by one with ctrl+z', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
        pistolBoxLevel: 0,
      });

      await user.keyboard('{Control>}z{/Control}');

      expect(storageContext.updatePistolBoxLevel).toHaveBeenCalledWith(1);
    });

    it('raises the box by one with cmd+z', async () => {
      const user = userEvent.setup();
      const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
        pistolBoxLevel: 4,
      });

      await user.keyboard('{Meta>}z{/Meta}');

      expect(storageContext.updatePistolBoxLevel).toHaveBeenCalledWith(5);
    });

    describe('when the box is already at its highest', () => {
      it('leaves the box alone', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithHealthStorage(<PistolBoxCard />, {
          pistolBoxLevel: 9,
        });

        await user.keyboard('{Control>}z{/Control}');

        expect(storageContext.updatePistolBoxLevel).not.toHaveBeenCalled();
      });
    });

    describe('while typing in a text field', () => {
      it('leaves the box alone', async () => {
        const user = userEvent.setup();
        const { storageContext } = renderWithHealthStorage(
          <>
            <PistolBoxCard />
            <input aria-label="Notes" />
          </>,
          { pistolBoxLevel: 3 },
        );

        await user.click(screen.getByRole('textbox', { name: 'Notes' }));
        await user.keyboard('{Control>}z{/Control}');

        expect(storageContext.updatePistolBoxLevel).not.toHaveBeenCalled();
      });
    });
  });
});
