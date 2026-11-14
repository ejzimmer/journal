import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlannedDateField } from './PlannedDateField';

const renderField = (date?: string) => {
  const onChange = jest.fn();
  render(<PlannedDateField date={date} isDone={false} onChange={onChange} />);
  return { onChange, user: userEvent.setup() };
};

describe('PlannedDateField', () => {
  describe('without a date', () => {
    describe('when a date is added', () => {
      it('saves it on Enter', async () => {
        const { onChange, user } = renderField();

        await user.click(
          screen.getByRole('button', { name: 'Add planned date' }),
        );
        await user.type(
          screen.getByLabelText('Planned date'),
          '2026-10-17{Enter}',
        );

        expect(onChange).toHaveBeenCalledWith('2026-10-17');
        expect(
          screen.getByRole('button', { name: 'Add planned date' }),
        ).toHaveFocus();
      });
    });
  });

  describe('with a date', () => {
    describe('when the date is cleared', () => {
      it('saves the cleared date when focus leaves', async () => {
        const { onChange, user } = renderField('2026-10-17');

        await user.click(
          screen.getByRole('button', { name: 'Change planned date' }),
        );
        await user.clear(screen.getByLabelText('Planned date'));
        await user.tab();

        expect(onChange).toHaveBeenCalledWith('');
      });
    });

    describe('when editing is cancelled with Escape', () => {
      it('keeps the date', async () => {
        const { onChange, user } = renderField('2026-10-17');

        await user.click(
          screen.getByRole('button', { name: 'Change planned date' }),
        );
        const input = screen.getByLabelText('Planned date');
        await user.clear(input);
        await user.keyboard('{Escape}');

        expect(input).not.toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
      });
    });
  });
});
