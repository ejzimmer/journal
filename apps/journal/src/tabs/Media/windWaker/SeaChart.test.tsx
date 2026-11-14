import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeaChart } from './SeaChart';

describe('SeaChart', () => {
  it('shows the revealed squares as pressed', () => {
    render(<SeaChart revealedSquares={[8]} onChange={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Sea chart B2' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Sea chart B3' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  describe('clicking a hidden square', () => {
    it('reveals it', async () => {
      const onChange = jest.fn();
      render(<SeaChart revealedSquares={[0, 9]} onChange={onChange} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'Sea chart A4' }),
      );

      expect(onChange).toHaveBeenCalledWith([0, 3, 9]);
    });
  });

  describe('clicking a revealed square', () => {
    it('hides it again', async () => {
      const onChange = jest.fn();
      render(<SeaChart revealedSquares={[0, 9]} onChange={onChange} />);

      await userEvent.click(
        screen.getByRole('button', { name: 'Sea chart B3' }),
      );

      expect(onChange).toHaveBeenCalledWith([0]);
    });
  });
});
