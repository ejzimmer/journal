import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusSelect } from './StatusSelect';

describe('StatusSelect', () => {
  describe('without a status', () => {
    it('shows not started', () => {
      render(<StatusSelect name="Episode 1" onChange={jest.fn()} />);

      expect(
        screen.getByRole('combobox', { name: 'Status of Episode 1' }),
      ).toHaveDisplayValue('Not started');
    });
  });

  it('saves the chosen status', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<StatusSelect name="Episode 1" onChange={onChange} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Status of Episode 1' }),
      'Done',
    );

    expect(onChange).toHaveBeenCalledWith('done');
  });
});
