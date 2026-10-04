import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CountGoal } from './CountGoal';

describe('CountGoal', () => {
  describe('editing the count', () => {
    describe('with a number', () => {
      it('saves the new count', async () => {
        const onChange = jest.fn();
        render(
          <CountGoal
            icon="./big-octo.png"
            label="Big Octos"
            value={3}
            total={8}
            onChange={onChange}
          />,
        );

        await userEvent.click(
          screen.getByRole('button', { name: 'Big Octos' }),
        );
        const input = screen.getByRole('textbox', { name: 'Big Octos' });
        await userEvent.clear(input);
        await userEvent.type(input, '4{Enter}');

        expect(onChange).toHaveBeenCalledWith(4);
      });
    });

    describe('with something that is not a number', () => {
      it('keeps the old count', async () => {
        const onChange = jest.fn();
        render(
          <CountGoal
            icon="./big-octo.png"
            label="Big Octos"
            value={3}
            total={8}
            onChange={onChange}
          />,
        );

        await userEvent.click(
          screen.getByRole('button', { name: 'Big Octos' }),
        );
        const input = screen.getByRole('textbox', { name: 'Big Octos' });
        await userEvent.clear(input);
        await userEvent.type(input, 'lots{Enter}');

        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});
