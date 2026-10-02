import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddExercise } from './AddExercise';

async function openAddExerciseForm() {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name: 'Add exercise' });
  await user.click(button);
  return { user, button };
}

describe('AddExercise', () => {
  describe('when the add exercise button is pressed', () => {
    it('replaces the button with a focused name field', async () => {
      render(<AddExercise onAdd={jest.fn()} />);

      const { button } = await openAddExerciseForm();

      expect(button).not.toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: 'Exercise name' }),
      ).toHaveFocus();
    });
  });

  describe('when a name is entered', () => {
    it('adds the exercise', async () => {
      const onAdd = jest.fn();
      render(<AddExercise onAdd={onAdd} />);
      const { user } = await openAddExerciseForm();

      await user.keyboard('Goblet squat{Enter}');

      expect(onAdd).toHaveBeenCalledWith('Goblet squat');
    });

    it('closes the field and returns focus to the add exercise button', async () => {
      render(<AddExercise onAdd={jest.fn()} />);
      const { user } = await openAddExerciseForm();
      const input = screen.getByRole('textbox', { name: 'Exercise name' });

      await user.keyboard('Goblet squat{Enter}');

      expect(input).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add exercise' }),
      ).toHaveFocus();
    });
  });

  describe('when the name is empty', () => {
    it("doesn't add an exercise", async () => {
      const onAdd = jest.fn();
      render(<AddExercise onAdd={onAdd} />);
      const { user } = await openAddExerciseForm();

      await user.keyboard('   {Enter}');

      expect(onAdd).not.toHaveBeenCalled();
    });
  });

  describe('when escape is pressed', () => {
    it('closes the field and returns focus to the add exercise button', async () => {
      render(<AddExercise onAdd={jest.fn()} />);
      const { user } = await openAddExerciseForm();
      const input = screen.getByRole('textbox', { name: 'Exercise name' });

      await user.keyboard('{Escape}');

      expect(input).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add exercise' }),
      ).toHaveFocus();
    });
  });
});
