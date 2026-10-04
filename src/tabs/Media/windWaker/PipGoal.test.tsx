import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PipGoal } from './PipGoal';

function setUpBottles(level: number) {
  const onChange = jest.fn();
  render(
    <PipGoal
      icon="./bottle.png"
      label="Bottles"
      level={level}
      levels={4}
      onChange={onChange}
    />,
  );
  return onChange;
}

describe('PipGoal', () => {
  it('fills the pips up to the current level', () => {
    setUpBottles(2);

    expect(
      screen.getByRole('button', { name: 'Bottles 2 of 4' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Bottles 3 of 4' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  describe('clicking an empty pip', () => {
    it('sets the level to that pip', async () => {
      const onChange = setUpBottles(2);

      await userEvent.click(
        screen.getByRole('button', { name: 'Bottles 4 of 4' }),
      );

      expect(onChange).toHaveBeenCalledWith(4);
    });
  });

  describe('clicking the last filled pip', () => {
    it('drops the level by one', async () => {
      const onChange = setUpBottles(2);

      await userEvent.click(
        screen.getByRole('button', { name: 'Bottles 2 of 4' }),
      );

      expect(onChange).toHaveBeenCalledWith(1);
    });
  });

  describe('clicking an earlier filled pip', () => {
    it('sets the level to that pip', async () => {
      const onChange = setUpBottles(3);

      await userEvent.click(
        screen.getByRole('button', { name: 'Bottles 1 of 4' }),
      );

      expect(onChange).toHaveBeenCalledWith(1);
    });
  });
});
