import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BikeGrid } from './BikeGrid';

const bikes = [
  { name: 'Diverge', icon: '🚲', isDone: true },
  { name: 'Uterus', icon: '📦', isDone: false },
];

describe('BikeGrid', () => {
  it('shows a checkbox for each bike, ticked when it is done', () => {
    render(<BikeGrid bikes={bikes} onBikeChange={jest.fn()} />);

    expect(screen.getByRole('checkbox', { name: 'Diverge' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Uterus' })).not.toBeChecked();
  });

  describe('when a bike is ticked', () => {
    it('marks that bike as done', async () => {
      const onBikeChange = jest.fn();
      render(<BikeGrid bikes={bikes} onBikeChange={onBikeChange} />);

      await userEvent.click(screen.getByRole('checkbox', { name: 'Uterus' }));

      expect(onBikeChange).toHaveBeenCalledWith(1, true);
    });
  });

  describe('when a bike is unticked', () => {
    it('marks that bike as not done', async () => {
      const onBikeChange = jest.fn();
      render(<BikeGrid bikes={bikes} onBikeChange={onBikeChange} />);

      await userEvent.click(screen.getByRole('checkbox', { name: 'Diverge' }));

      expect(onBikeChange).toHaveBeenCalledWith(0, false);
    });
  });
});
