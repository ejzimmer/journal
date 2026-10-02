import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  EditChapterForm,
  EditEpisodeForm,
  EditMediaForm,
  EditSeasonForm,
  EditVideoForm,
  EditVolumeForm,
} from './EditItemForms';
import { Chapter, Episode, TvSeries, Video, Volume } from './types';

async function openForm() {
  const user = userEvent.setup();
  await user.click(screen.getByText('Edit'));
  return {
    user,
    save: () => user.click(screen.getByRole('button', { name: 'Save' })),
  };
}

describe('EditMediaForm', () => {
  const lupin: TvSeries = {
    id: 'lupin',
    type: 'tv',
    name: 'Lupin',
    language: 'french',
  };

  it('saves the new name and language', async () => {
    const onChange = jest.fn();
    render(<EditMediaForm media={lupin} onChange={onChange} />);
    const { user, save } = await openForm();

    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'ルパン');
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Language' }),
      'Japanese',
    );
    await save();

    expect(onChange).toHaveBeenCalledWith({
      name: 'ルパン',
      language: 'japanese',
    });
  });

  it('closes after saving', async () => {
    render(<EditMediaForm media={lupin} onChange={jest.fn()} />);
    const { save } = await openForm();
    const details = screen.getByRole('group');

    await save();

    expect(details).not.toHaveAttribute('open');
  });

  describe('without a name', () => {
    it('does not save', async () => {
      const onChange = jest.fn();
      render(<EditMediaForm media={lupin} onChange={onChange} />);
      const { user, save } = await openForm();

      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

describe('EditSeasonForm', () => {
  it('saves the new number', async () => {
    const onChange = jest.fn();
    render(
      <EditSeasonForm
        name="Season 1"
        season={{ id: 's1', number: 1 }}
        onChange={onChange}
      />,
    );
    const { user, save } = await openForm();

    await user.clear(screen.getByRole('spinbutton', { name: 'Number' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Number' }), '3');
    await save();

    expect(onChange).toHaveBeenCalledWith({ number: 3 });
  });
});

describe('EditEpisodeForm', () => {
  const episode: Episode = {
    id: 'e1',
    number: 1,
    name: 'Chapitre 1',
    lengthInSeconds: 2826,
    lookups: 2,
    aiQuestions: 1,
  };

  it('starts with the current values', async () => {
    render(
      <EditEpisodeForm
        name="Chapitre 1"
        episode={episode}
        onChange={jest.fn()}
      />,
    );
    await openForm();

    expect(screen.getByRole('textbox', { name: 'Length' })).toHaveValue(
      '47:06',
    );
  });

  it('saves the new name and length', async () => {
    const onChange = jest.fn();
    render(
      <EditEpisodeForm
        name="Chapitre 1"
        episode={episode}
        onChange={onChange}
      />,
    );
    const { user, save } = await openForm();

    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Pilote');
    await user.clear(screen.getByRole('textbox', { name: 'Length' }));
    await user.type(screen.getByRole('textbox', { name: 'Length' }), '50:00');
    await save();

    expect(onChange).toHaveBeenCalledWith({
      number: 1,
      name: 'Pilote',
      lengthInSeconds: 3000,
    });
  });

  describe('when the name and length are cleared', () => {
    it('clears them', async () => {
      const onChange = jest.fn();
      render(
        <EditEpisodeForm
          name="Chapitre 1"
          episode={episode}
          onChange={onChange}
        />,
      );
      const { user, save } = await openForm();

      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await user.clear(screen.getByRole('textbox', { name: 'Length' }));
      await save();

      expect(onChange.mock.calls[0][0]).toStrictEqual({
        number: 1,
        name: undefined,
        lengthInSeconds: undefined,
      });
    });
  });
});

describe('EditVideoForm', () => {
  const video: Video = {
    id: 'v1',
    url: 'https://youtu.be/1',
    lookups: 0,
    aiQuestions: 0,
  };

  it('saves the new url and length', async () => {
    const onChange = jest.fn();
    render(<EditVideoForm video={video} onChange={onChange} />);
    const { user, save } = await openForm();

    await user.clear(screen.getByRole('textbox', { name: 'URL' }));
    await user.type(
      screen.getByRole('textbox', { name: 'URL' }),
      'https://youtu.be/2',
    );
    await user.type(screen.getByRole('textbox', { name: 'Length' }), '1:02:05');
    await save();

    expect(onChange).toHaveBeenCalledWith({
      url: 'https://youtu.be/2',
      lengthInSeconds: 3725,
    });
  });
});

describe('EditVolumeForm', () => {
  const volume: Volume = {
    id: 'vol1',
    number: 1,
    name: 'Astérix le Gaulois',
    pages: 48,
  };

  it('saves the new number, name and pages', async () => {
    const onChange = jest.fn();
    render(
      <EditVolumeForm
        name="Astérix le Gaulois"
        volume={volume}
        isNameRequired
        onChange={onChange}
      />,
    );
    const { user, save } = await openForm();

    await user.clear(screen.getByRole('spinbutton', { name: 'Number' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Number' }), '2');
    await user.clear(screen.getByRole('textbox', { name: 'Name' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'La Serpe');
    await user.clear(screen.getByRole('spinbutton', { name: 'Pages' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Pages' }), '50');
    await save();

    expect(onChange).toHaveBeenCalledWith({
      number: 2,
      name: 'La Serpe',
      pages: 50,
    });
  });

  describe('when the name is required and cleared', () => {
    it('does not save', async () => {
      const onChange = jest.fn();
      render(
        <EditVolumeForm
          name="Astérix le Gaulois"
          volume={volume}
          isNameRequired
          onChange={onChange}
        />,
      );
      const { user, save } = await openForm();

      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

describe('EditChapterForm', () => {
  const chapter: Chapter = { id: 'c1', number: 1, lookups: 0, aiQuestions: 0 };

  it('saves the new name and last page', async () => {
    const onChange = jest.fn();
    render(
      <EditChapterForm
        name="Chapter 1"
        chapter={chapter}
        onChange={onChange}
      />,
    );
    const { user, save } = await openForm();

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Prologue');
    await user.type(
      screen.getByRole('spinbutton', { name: 'Last page' }),
      '38',
    );
    await save();

    expect(onChange).toHaveBeenCalledWith({
      number: 1,
      name: 'Prologue',
      lastPage: 38,
    });
  });
});
