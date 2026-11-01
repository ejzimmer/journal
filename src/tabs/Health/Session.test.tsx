import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Session } from './Session';

function setUpSession() {
  render(
    <Session
      name="Class 3"
      label="Spinning: Class 3"
      isChecked={false}
      onToggle={jest.fn()}
    />,
  );
  return screen.getByText('Class 3');
}

describe('Session', () => {
  describe('its tooltip', () => {
    describe('when the pointer is over the session', () => {
      it('shows the class name', async () => {
        const tooltip = setUpSession();

        await userEvent.hover(screen.getByRole('checkbox'));

        expect(tooltip).toBeVisible();
      });

      describe('and then moves away', () => {
        it('hides it again', async () => {
          const tooltip = setUpSession();
          await userEvent.hover(screen.getByRole('checkbox'));

          await userEvent.unhover(screen.getByRole('checkbox'));

          expect(tooltip).not.toBeVisible();
        });
      });
    });

    describe('when the session is focused with the keyboard', () => {
      it('shows the class name', async () => {
        const tooltip = setUpSession();

        await userEvent.tab();

        expect(tooltip).toBeVisible();
      });

      describe('and then focus moves on', () => {
        it('hides it again', async () => {
          const tooltip = setUpSession();
          await userEvent.tab();

          await userEvent.tab();

          expect(tooltip).not.toBeVisible();
        });
      });
    });
  });
});
