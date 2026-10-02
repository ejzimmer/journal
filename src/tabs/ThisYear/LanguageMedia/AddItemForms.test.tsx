import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AddChapterForm,
  AddEpisodeForm,
  AddSeasonForm,
  AddVideoForm,
  AddVolumeForm,
} from './AddItemForms';

describe('AddSeasonForm', () => {
  describe('with a number of episodes', () => {
    it('adds the next season with that many episodes', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddSeasonForm seasons={[{ number: 1 }]} onAdd={onAdd} />);

      await user.type(
        screen.getByRole('spinbutton', { name: 'Episodes' }),
        '2',
      );
      await user.click(screen.getByRole('button', { name: 'Add season' }));

      expect(onAdd).toHaveBeenCalledWith({
        number: 2,
        episodes: [
          { number: 1, lookups: 0, aiQuestions: 0 },
          { number: 2, lookups: 0, aiQuestions: 0 },
        ],
      });
    });
  });

  describe('without a number of episodes', () => {
    it('adds a season with no episodes', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddSeasonForm onAdd={onAdd} />);

      await user.click(screen.getByRole('button', { name: 'Add season' }));

      expect(onAdd).toHaveBeenCalledWith({ number: 1, episodes: [] });
    });
  });
});

describe('AddEpisodeForm', () => {
  const episodes = [
    { number: 1, lookups: 0, aiQuestions: 0 },
    { number: 4, lookups: 0, aiQuestions: 0 },
  ];

  it('adds an episode numbered after the last one, with its name and length', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(<AddEpisodeForm episodes={episodes} onAdd={onAdd} />);

    await user.type(
      screen.getByRole('textbox', { name: 'Name' }),
      'Chapitre 5',
    );
    await user.type(screen.getByRole('textbox', { name: 'Length' }), '47:06');
    await user.click(screen.getByRole('button', { name: 'Add episode' }));

    expect(onAdd).toHaveBeenCalledWith({
      number: 5,
      name: 'Chapitre 5',
      lengthInSeconds: 2826,
      lookups: 0,
      aiQuestions: 0,
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

  describe('with a length that is not mm:ss', () => {
    it('does not add the episode', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddEpisodeForm episodes={episodes} onAdd={onAdd} />);

      await user.type(screen.getByRole('textbox', { name: 'Length' }), '47');
      await user.click(screen.getByRole('button', { name: 'Add episode' }));

      expect(onAdd).not.toHaveBeenCalled();
    });
  });
});

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

describe('AddVolumeForm', () => {
  describe('when the name is optional', () => {
    it('adds the next volume without one', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(
        <AddVolumeForm
          volumes={[{ number: 1 }]}
          isNameRequired={false}
          onAdd={onAdd}
        />,
      );

      await user.type(screen.getByRole('spinbutton', { name: 'Pages' }), '180');
      await user.click(screen.getByRole('button', { name: 'Add volume' }));

      expect(onAdd).toHaveBeenCalledWith({ number: 2, pages: 180 });
    });
  });

  describe('when the name is required', () => {
    it('adds the volume with its name', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddVolumeForm isNameRequired onAdd={onAdd} />);

      await user.type(
        screen.getByRole('textbox', { name: 'Name' }),
        'Astérix le Gaulois',
      );
      await user.click(screen.getByRole('button', { name: 'Add volume' }));

      expect(onAdd).toHaveBeenCalledWith({
        number: 1,
        name: 'Astérix le Gaulois',
      });
    });

    describe('and missing', () => {
      it('does not add the volume', async () => {
        const user = userEvent.setup();
        const onAdd = jest.fn();
        render(<AddVolumeForm isNameRequired onAdd={onAdd} />);

        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(onAdd).not.toHaveBeenCalled();
      });
    });
  });
});

describe('AddChapterForm', () => {
  it('adds the next chapter with its name and last page', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(
      <AddChapterForm
        chapters={[{ number: 1, lookups: 0, aiQuestions: 0 }]}
        onAdd={onAdd}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Prologue');
    await user.type(
      screen.getByRole('spinbutton', { name: 'Last page' }),
      '38',
    );
    await user.click(screen.getByRole('button', { name: 'Add chapter' }));

    expect(onAdd).toHaveBeenCalledWith({
      number: 2,
      name: 'Prologue',
      lastPage: 38,
      lookups: 0,
      aiQuestions: 0,
    });
  });

  it('clears the form after adding', async () => {
    const user = userEvent.setup();
    render(<AddChapterForm onAdd={jest.fn()} />);
    const name = screen.getByRole('textbox', { name: 'Name' });

    await user.type(name, 'Prologue');
    await user.click(screen.getByRole('button', { name: 'Add chapter' }));

    expect(name).toHaveValue('');
  });
});
