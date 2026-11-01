import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

function setUpTooltip() {
  render(
    <Tooltip text="Class 3">
      <input type="checkbox" aria-label="Spinning: Class 3" />
    </Tooltip>,
  );
  return screen.getByText('Class 3');
}

describe('Tooltip', () => {
  describe('when the pointer moves over the trigger', () => {
    it('shows the tooltip', async () => {
      const tooltip = setUpTooltip();

      await userEvent.hover(screen.getByRole('checkbox'));

      expect(tooltip).toBeVisible();
    });

    describe('and then moves away', () => {
      it('hides the tooltip again', async () => {
        const tooltip = setUpTooltip();
        await userEvent.hover(screen.getByRole('checkbox'));

        await userEvent.unhover(screen.getByRole('checkbox'));

        expect(tooltip).not.toBeVisible();
      });
    });
  });

  describe('when the user tabs to the trigger', () => {
    it('shows the tooltip', async () => {
      const tooltip = setUpTooltip();

      await userEvent.tab();

      expect(tooltip).toBeVisible();
    });

    describe('and then tabs away', () => {
      it('hides the tooltip again', async () => {
        const tooltip = setUpTooltip();
        await userEvent.tab();

        await userEvent.tab();

        expect(tooltip).not.toBeVisible();
      });
    });
  });
});
