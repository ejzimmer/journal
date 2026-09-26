import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseForm } from './ExerciseForm';

describe('ExerciseForm', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['setTimeout'] });
    jest.setSystemTime(new Date('2026-09-02T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when it opens', () => {
    it('is labelled with the exercise', () => {
      render(
        <ExerciseForm
          exerciseName="Plank"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />,
      );

      expect(
        screen.getByRole('form', { name: 'Record Plank' }),
      ).toBeInTheDocument();
    });

    it("defaults the date to today's", () => {
      render(
        <ExerciseForm
          exerciseName="Plank"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />,
      );

      expect(screen.getByLabelText('Date')).toHaveValue('2026-09-02');
    });

    it('focuses the details', () => {
      render(
        <ExerciseForm
          exerciseName="Plank"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Details' })).toHaveFocus();
    });

    it('defaults the recommendation to no change', () => {
      render(
        <ExerciseForm
          exerciseName="Plank"
          onSubmit={jest.fn()}
          onCancel={jest.fn()}
        />,
      );

      expect(screen.getByRole('radio', { name: 'no change' })).toBeChecked();
    });
  });

  describe('when it is saved', () => {
    it('submits the date, details and recommendation', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn();
      render(
        <ExerciseForm
          exerciseName="Plank"
          onSubmit={onSubmit}
          onCancel={jest.fn()}
        />,
      );

      const date = screen.getByLabelText('Date');
      await user.clear(date);
      await user.type(date, '2026-09-20');
      await user.type(
        screen.getByRole('textbox', { name: 'Details' }),
        '3 x 60s',
      );
      await user.click(screen.getByRole('radio', { name: 'decrease' }));
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledWith({
        date: '2026-09-20',
        details: '3 x 60s',
        recommendation: 'decrease',
      });
    });

    describe('with no change recommended', () => {
      it('submits without a recommendation', async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        render(
          <ExerciseForm
            exerciseName="Plank"
            onSubmit={onSubmit}
            onCancel={jest.fn()}
          />,
        );

        await user.type(
          screen.getByRole('textbox', { name: 'Details' }),
          '3 x 60s',
        );
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(onSubmit).toHaveBeenCalledWith({
          date: '2026-09-02',
          details: '3 x 60s',
        });
      });
    });

    describe('without any details', () => {
      it("doesn't submit", async () => {
        const user = userEvent.setup();
        const onSubmit = jest.fn();
        render(
          <ExerciseForm
            exerciseName="Plank"
            onSubmit={onSubmit}
            onCancel={jest.fn()}
          />,
        );

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('when it is cancelled', () => {
    it.each([
      [
        'with the cancel button',
        (user: ReturnType<typeof userEvent.setup>) =>
          user.click(screen.getByRole('button', { name: 'Cancel' })),
      ],
      [
        'with escape',
        (user: ReturnType<typeof userEvent.setup>) => user.keyboard('{Escape}'),
      ],
    ])('cancels %s', async (_, cancel) => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(
        <ExerciseForm
          exerciseName="Plank"
          onSubmit={jest.fn()}
          onCancel={onCancel}
        />,
      );

      await cancel(user);

      expect(onCancel).toHaveBeenCalled();
    });
  });
});
