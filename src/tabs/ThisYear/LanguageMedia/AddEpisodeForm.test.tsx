import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddEpisodeForm } from './AddEpisodeForm';

describe('AddEpisodeForm', () => {
  const episodes = {
    e1: { id: 'e1', number: 1, lookups: 0, aiQuestions: 0 },
    e4: { id: 'e4', number: 4, lookups: 0, aiQuestions: 0 },
  };

  it('adds an episode numbered after the last one, with its name and length', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(<AddEpisodeForm episodes={episodes} onAdd={onAdd} />);

    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Chapitre 5',
    );
    await user.type(screen.getByRole('textbox', { name: 'Minutes' }), '47');
    await user.type(screen.getByRole('textbox', { name: 'Seconds' }), '6');
    await user.click(screen.getByRole('button', { name: 'Add episode' }));

    expect(onAdd).toHaveBeenCalledWith({
      number: 5,
      name: 'Chapitre 5',
      lengthInSeconds: 2826,
      lookups: 0,
      aiQuestions: 0,
    });
  });

  describe('with only minutes', () => {
    it('adds an episode of whole minutes', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddEpisodeForm episodes={episodes} onAdd={onAdd} />);

      await user.type(screen.getByRole('textbox', { name: 'Minutes' }), '45');
      await user.click(screen.getByRole('button', { name: 'Add episode' }));

      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ lengthInSeconds: 2700 }),
      );
    });
  });

  describe('without a name or length', () => {
    it('adds an episode with neither', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddEpisodeForm episodes={episodes} onAdd={onAdd} />);

      await user.click(screen.getByRole('button', { name: 'Add episode' }));

      expect(onAdd).toHaveBeenCalledWith({
        number: 5,
        lookups: 0,
        aiQuestions: 0,
      });
    });
  });

  describe('with more than 59 seconds', () => {
    it('does not add the episode', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddEpisodeForm episodes={episodes} onAdd={onAdd} />);

      await user.type(screen.getByRole('textbox', { name: 'Seconds' }), '60');
      await user.click(screen.getByRole('button', { name: 'Add episode' }));

      expect(onAdd).not.toHaveBeenCalled();
    });
  });
});
