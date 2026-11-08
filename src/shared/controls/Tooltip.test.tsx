import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { longPress } from './longPressTestUtils';
import { Tooltip } from './Tooltip';

function setUpTooltip() {
  render(
    <Tooltip label="Class 3">
      {(triggerProps) => (
        <input
          {...triggerProps}
          type="checkbox"
          aria-label="Spinning: Class 3"
        />
      )}
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

  describe('on a touchscreen', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('when the user long-presses the trigger', () => {
      it('shows the tooltip', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const tooltip = setUpTooltip();

        await longPress(user, screen.getByRole('checkbox'));

        expect(tooltip).toBeVisible();
      });

      it("stops the browser's own long-press menu", async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        setUpTooltip();

        const { notCancelled } = await longPress(
          user,
          screen.getByRole('checkbox'),
        );

        expect(notCancelled).toBe(false);
      });

      it('does not toggle the trigger', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        setUpTooltip();
        const checkbox = screen.getByRole('checkbox');

        await longPress(user, checkbox);

        expect(checkbox).not.toBeChecked();
      });

      describe('and then touches the screen again', () => {
        it('hides the tooltip', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          const tooltip = setUpTooltip();
          await longPress(user, screen.getByRole('checkbox'));

          await user.pointer({ keys: '[TouchA]', target: document.body });

          expect(tooltip).not.toBeVisible();
        });
      });
    });
  });

  describe('when the user right-clicks the trigger with a mouse', () => {
    it("leaves the browser's context menu alone", async () => {
      const user = userEvent.setup();
      setUpTooltip();
      const checkbox = screen.getByRole('checkbox');
      await user.pointer({ keys: '[MouseRight>]', target: checkbox });

      expect(fireEvent.contextMenu(checkbox)).toBe(true);
    });
  });
});
