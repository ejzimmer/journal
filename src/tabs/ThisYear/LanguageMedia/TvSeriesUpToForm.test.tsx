import { render, screen } from '@testing-library/react';
import { TvSeriesUpToForm } from './TvSeriesUpToForm';
import { openDisclosureForm } from './disclosureFormTestUtils';

describe('TvSeriesUpToForm', () => {
  it('saves the season, episode and timestamp', async () => {
    const onChange = jest.fn();
    render(
      <TvSeriesUpToForm
        upTo={{ season: 1, episode: 2, timestampInSeconds: 754 }}
        onChange={onChange}
      />,
    );
    const { user, save } = await openDisclosureForm('Update');

    await user.clear(screen.getByRole('spinbutton', { name: 'Episode' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Episode' }), '3');
    await user.clear(screen.getByRole('textbox', { name: 'Minutes' }));
    await user.type(screen.getByRole('textbox', { name: 'Minutes' }), '5');
    await user.clear(screen.getByRole('textbox', { name: 'Seconds' }));
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
      const { user, save } = await openDisclosureForm('Update');

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
      const { user, save } = await openDisclosureForm('Update');

      await user.type(screen.getByRole('spinbutton', { name: 'Season' }), '2');
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
