import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableDate } from './EditableDate';

const DATE = '2026-10-09';

describe('EditableDate', () => {
  describe('when the date is being edited', () => {
    describe('and the user picks a new date and presses enter', () => {
      it('calls onChange with the new date', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<EditableDate value={DATE} onChange={onChange} />);

        await user.click(getDisplayedDate());
        const input = getInput();
        fireEvent.change(input, { target: { value: '2026-10-20' } });
        await user.keyboard('{Enter}');

        expect(onChange).toHaveBeenCalledWith('2026-10-20');
        expect(input).not.toBeInTheDocument();
      });
    });

    describe('and the user clears the date and presses enter', () => {
      it('calls onChange with an empty date', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<EditableDate value={DATE} onChange={onChange} />);

        await user.click(getDisplayedDate());
        const input = getInput();
        fireEvent.change(input, { target: { value: '' } });
        await user.keyboard('{Enter}');

        expect(onChange).toHaveBeenCalledWith('');
        expect(input).not.toBeInTheDocument();
      });
    });

    describe('and the user changes the date and presses escape', () => {
      it('closes the input without calling onChange', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        render(<EditableDate value={DATE} onChange={onChange} />);

        await user.click(getDisplayedDate());
        const input = getInput();
        fireEvent.change(input, { target: { value: '' } });
        await user.keyboard('{Escape}');

        expect(input).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
      });

      it('shows the original date when editing again', async () => {
        const user = userEvent.setup();
        render(<EditableDate value={DATE} onChange={jest.fn()} />);

        await user.click(getDisplayedDate());
        fireEvent.change(getInput(), { target: { value: '' } });
        await user.keyboard('{Escape}');
        await user.click(getDisplayedDate());

        expect(getInput()).toHaveValue(DATE);
      });
    });
  });
});

const getDisplayedDate = () => screen.getByRole('button', { name: /Due date/ });
const getInput = () => screen.getByLabelText('Due date');
