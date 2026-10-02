import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PrintSeriesUpToForm,
  StatusSelect,
  TvSeriesUpToForm,
  VideoUpToForm,
} from './ProgressForms';

async function openForm() {
  const user = userEvent.setup();
  await user.click(screen.getByText('Update'));
  return {
    user,
    save: () => user.click(screen.getByRole('button', { name: 'Save' })),
  };
}

describe('TvSeriesUpToForm', () => {
  it('saves the season, episode and timestamp', async () => {
    const onChange = jest.fn();
    render(
      <TvSeriesUpToForm
        upTo={{ season: 1, episode: 2, timestampInSeconds: 754 }}
        onChange={onChange}
      />,
    );
    const { user, save } = await openForm();

    await user.clear(screen.getByRole('spinbutton', { name: 'Episode' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Episode' }), '3');
    await user.clear(screen.getByRole('textbox', { name: 'Timestamp' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Timestamp' }),
      '05:00',
    );
    await save();

    expect(onChange).toHaveBeenCalledWith({
      season: 1,
      episode: 3,
      timestampInSeconds: 300,
    });
  });

  describe('without a timestamp', () => {
    it('saves the start of the episode', async () => {
      const onChange = jest.fn();
      render(<TvSeriesUpToForm upTo={undefined} onChange={onChange} />);
      const { user, save } = await openForm();

      await user.type(screen.getByRole('spinbutton', { name: 'Season' }), '2');
      await user.type(screen.getByRole('spinbutton', { name: 'Episode' }), '1');
      await save();

      expect(onChange).toHaveBeenCalledWith({
        season: 2,
        episode: 1,
        timestampInSeconds: 0,
      });
    });
  });

  describe('without an episode', () => {
    it('does not save', async () => {
      const onChange = jest.fn();
      render(<TvSeriesUpToForm upTo={undefined} onChange={onChange} />);
      const { user, save } = await openForm();

      await user.type(screen.getByRole('spinbutton', { name: 'Season' }), '2');
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});

describe('PrintSeriesUpToForm', () => {
  it('saves the volume, chapter and page', async () => {
    const onChange = jest.fn();
    render(<PrintSeriesUpToForm upTo={undefined} onChange={onChange} />);
    const { user, save } = await openForm();

    await user.type(screen.getByRole('spinbutton', { name: 'Volume' }), '1');
    await user.type(screen.getByRole('spinbutton', { name: 'Chapter' }), '2');
    await user.type(screen.getByRole('spinbutton', { name: 'Page' }), '41');
    await save();

    expect(onChange).toHaveBeenCalledWith({ volume: 1, chapter: 2, page: 41 });
  });
});

describe('VideoUpToForm', () => {
  it('saves the timestamp', async () => {
    const onChange = jest.fn();
    render(<VideoUpToForm name="https://youtu.be/1" onChange={onChange} />);
    const { user, save } = await openForm();

    await user.type(
      screen.getByRole('textbox', { name: 'Timestamp' }),
      '0:20:00',
    );
    await save();

    expect(onChange).toHaveBeenCalledWith(1200);
  });
});

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
