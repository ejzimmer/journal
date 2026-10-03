import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bikes, BikesGoal } from './Bikes';

const goal: BikesGoal = {
  id: 'bikes',
  bikes: [
    { name: 'Diverge', icon: '🚲', isDone: true },
    { name: 'Uterus', icon: '📦', isDone: false },
  ],
};

describe('Bikes', () => {
  it('shows a checkbox for each bike, ticked when it is done', () => {
    render(<Bikes goal={goal} onChange={jest.fn()} />);

    expect(screen.getByRole('checkbox', { name: 'Diverge' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Uterus' })).not.toBeChecked();
  });

  describe('when a bike is ticked', () => {
    it('marks that bike as done', async () => {
      const onChange = jest.fn();
      render(<Bikes goal={goal} onChange={onChange} />);

      await userEvent.click(screen.getByRole('checkbox', { name: 'Uterus' }));

      expect(onChange).toHaveBeenCalledWith({
        id: 'bikes',
        bikes: [
          { name: 'Diverge', icon: '🚲', isDone: true },
          { name: 'Uterus', icon: '📦', isDone: true },
        ],
      });
    });
  });
});
