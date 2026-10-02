import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseUpdate } from '../../shared/types';
import { UpdateChip } from './UpdateChip';

const update: ExerciseUpdate = {
  id: 'a',
  date: '2026-08-12',
  details: '3 x 10\n16kg',
  recommendation: 'increase',
};

describe('UpdateChip', () => {
  it('shows the date, details and recommendation', () => {
    render(
      <UpdateChip
        ref={null}
        update={update}
        isEditing={false}
        onClick={jest.fn()}
      />,
    );

    const chip = screen.getByRole('button', { name: /12 Aug 26/ });
    expect(chip).toHaveTextContent('3 x 10 16kg');
    expect(
      within(chip).getByRole('img', { name: 'increase' }),
    ).toBeInTheDocument();
  });

  describe('when its update is being edited', () => {
    it('shows as expanded', () => {
      render(
        <UpdateChip
          ref={null}
          update={update}
          isEditing={true}
          onClick={jest.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /12 Aug 26/ })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });
  });

  describe('when it is pressed', () => {
    it('calls onClick', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <UpdateChip
          ref={null}
          update={update}
          isEditing={false}
          onClick={onClick}
        />,
      );

      await user.click(screen.getByRole('button', { name: /12 Aug 26/ }));

      expect(onClick).toHaveBeenCalled();
    });
  });
});
