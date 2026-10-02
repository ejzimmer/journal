import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddSeasonForm } from './AddSeasonForm';

describe('AddSeasonForm', () => {
  describe('with a number of episodes', () => {
    it('adds the next season with that many episodes', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(
        <AddSeasonForm
          seasons={{ s1: { id: 's1', number: 1 } }}
          onAdd={onAdd}
        />,
      );

      await user.type(
        screen.getByRole('spinbutton', { name: 'Episodes' }),
        '2',
      );
      await user.click(screen.getByRole('button', { name: 'Add season' }));

      expect(onAdd).toHaveBeenCalledWith({ number: 2 }, [
        { number: 1, lookups: 0, aiQuestions: 0 },
        { number: 2, lookups: 0, aiQuestions: 0 },
      ]);
    });
  });

  describe('without a number of episodes', () => {
    it('adds a season with no episodes', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddSeasonForm onAdd={onAdd} />);

      await user.click(screen.getByRole('button', { name: 'Add season' }));

      expect(onAdd).toHaveBeenCalledWith({ number: 1 }, []);
    });
  });
});
