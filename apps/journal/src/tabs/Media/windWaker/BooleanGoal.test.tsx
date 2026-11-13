import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BooleanGoal } from './BooleanGoal';

describe('BooleanGoal', () => {
  describe('when the goal is not done', () => {
    it('marks it done when clicked', async () => {
      const onChange = jest.fn();
      render(
        <BooleanGoal
          icon="./grandma.png"
          label="Cure Grandma"
          isChecked={false}
          onChange={onChange}
        />,
      );

      await userEvent.click(
        screen.getByRole('checkbox', { name: 'Cure Grandma' }),
      );

      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('when the goal is done', () => {
    it('marks it not done when clicked', async () => {
      const onChange = jest.fn();
      render(
        <BooleanGoal
          icon="./grandma.png"
          label="Cure Grandma"
          isChecked
          onChange={onChange}
        />,
      );

      await userEvent.click(
        screen.getByRole('checkbox', { name: 'Cure Grandma' }),
      );

      expect(onChange).toHaveBeenCalledWith(false);
    });
  });
});
