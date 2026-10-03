import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithHealthStorage } from './healthStorageTestUtils';
import { AddExerciseClass } from './AddExerciseClass';

async function openAddClassForm() {
  const user = userEvent.setup();
  const { storageContext } = renderWithHealthStorage(<AddExerciseClass />);
  const button = screen.getByRole('button', { name: 'Add class' });
  await user.click(button);
  return { user, button, addClass: storageContext.addClass };
}

async function typeCount(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
  value: string,
) {
  const input = screen.getByRole('spinbutton', { name });
  await user.clear(input);
  await user.type(input, value);
}

describe('AddExerciseClass', () => {
  describe('when the add class button is pressed', () => {
    it('replaces the button with a form with the name field focused', async () => {
      const { button } = await openAddClassForm();

      expect(button).not.toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveFocus();
    });

    it('starts on a set number of classes, with the weekly counts disabled', async () => {
      await openAddClassForm();

      expect(
        screen.getByRole('radio', { name: 'Set number of classes' }),
      ).toBeChecked();
      expect(screen.getByRole('spinbutton', { name: 'Classes' })).toBeEnabled();
      expect(screen.getByRole('spinbutton', { name: 'Weeks' })).toBeDisabled();
      expect(
        screen.getByRole('spinbutton', { name: 'Classes a week' }),
      ).toBeDisabled();
    });
  });

  describe('a set number of classes', () => {
    it('adds the class as one block of that many classes', async () => {
      const { user, addClass } = await openAddClassForm();

      await user.keyboard('Wheel');
      await typeCount(user, 'Classes', '30');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(addClass).toHaveBeenCalledWith({
        description: 'Wheel',
        blocks: [{ id: expect.any(String), total: 30 }],
      });
    });

    it('closes the form and returns focus to the add class button', async () => {
      const { user } = await openAddClassForm();
      const form = screen.getByRole('form', { name: 'Add class' });

      await user.keyboard('Wheel{Enter}');

      expect(form).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add class' })).toHaveFocus();
    });
  });

  describe('weekly classes', () => {
    it('enables the weekly counts and disables the set count', async () => {
      const { user } = await openAddClassForm();

      await user.click(screen.getByRole('radio', { name: 'Weekly classes' }));

      expect(screen.getByRole('spinbutton', { name: 'Weeks' })).toBeEnabled();
      expect(
        screen.getByRole('spinbutton', { name: 'Classes a week' }),
      ).toBeEnabled();
      expect(
        screen.getByRole('spinbutton', { name: 'Classes' }),
      ).toBeDisabled();
    });

    it('adds the class as a block per week', async () => {
      const { user, addClass } = await openAddClassForm();

      await user.keyboard('Pistol squat');
      await user.click(screen.getByRole('radio', { name: 'Weekly classes' }));
      await typeCount(user, 'Weeks', '2');
      await typeCount(user, 'Classes a week', '6');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(addClass).toHaveBeenCalledWith({
        description: 'Pistol squat',
        blocks: [
          { id: expect.any(String), total: 6 },
          { id: expect.any(String), total: 6 },
        ],
      });
    });
  });

  describe('when the unselected row is clicked', () => {
    it('selects that kind of class and focuses its first count', async () => {
      const { user } = await openAddClassForm();

      await user.click(screen.getByText('weeks ×'));

      expect(
        screen.getByRole('radio', { name: 'Weekly classes' }),
      ).toBeChecked();
      expect(screen.getByRole('spinbutton', { name: 'Weeks' })).toHaveFocus();
    });
  });

  describe('when the name is blank', () => {
    it("doesn't add a class", async () => {
      const { user, addClass } = await openAddClassForm();

      await user.keyboard('   ');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(addClass).not.toHaveBeenCalled();
    });
  });

  describe('when a count is not a whole number of classes', () => {
    it("doesn't add a class", async () => {
      const { user, addClass } = await openAddClassForm();

      await user.keyboard('Wheel');
      await typeCount(user, 'Classes', '2.5');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(addClass).not.toHaveBeenCalled();
    });
  });

  describe.each([
    [
      'cancel is pressed',
      (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole('button', { name: 'Cancel' })),
    ],
    [
      'escape is pressed',
      (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}'),
    ],
  ])('when %s', (_, closeForm) => {
    it('closes the form without adding a class and focuses the add class button', async () => {
      const { user, addClass } = await openAddClassForm();
      const form = screen.getByRole('form', { name: 'Add class' });

      await user.keyboard('Wheel');
      await closeForm(user);

      expect(form).not.toBeInTheDocument();
      expect(addClass).not.toHaveBeenCalled();
      expect(screen.getByRole('button', { name: 'Add class' })).toHaveFocus();
    });
  });
});
