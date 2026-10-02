import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddVideoForm } from './AddVideoForm';

describe('AddVideoForm', () => {
  it('adds a video with its url and length', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(<AddVideoForm onAdd={onAdd} />);

    await user.type(
      screen.getByRole('textbox', { name: 'URL' }),
      'https://youtu.be/1',
    );
    await user.type(screen.getByRole('textbox', { name: 'Length' }), '1:02:05');
    await user.click(screen.getByRole('button', { name: 'Add video' }));

    expect(onAdd).toHaveBeenCalledWith({
      url: 'https://youtu.be/1',
      lengthInSeconds: 3725,
      lookups: 0,
      aiQuestions: 0,
    });
  });

  describe('without a url', () => {
    it('does not add the video', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddVideoForm onAdd={onAdd} />);

      await user.click(screen.getByRole('button', { name: 'Add video' }));

      expect(onAdd).not.toHaveBeenCalled();
    });
  });
});
