import { render, screen } from '@testing-library/react';
import { EditEpisodeForm } from './EditEpisodeForm';
import { openDisclosureForm } from './disclosureFormTestUtils';
import { Episode } from './types';

describe('EditEpisodeForm', () => {
  const episode: Episode = {
    id: 'e1',
    number: 1,
    name: 'Chapitre 1',
    lengthInSeconds: 2826,
    lookups: 2,
    aiQuestions: 1,
  };

  describe('when the episode has changed since the form was rendered', () => {
    it('opens with the current values', async () => {
      const { rerender } = render(
        <EditEpisodeForm
          name="Chapitre 1"
          episode={episode}
          onChange={jest.fn()}
        />,
      );
      rerender(
        <EditEpisodeForm
          name="Chapitre 1"
          episode={{ ...episode, lengthInSeconds: 3000 }}
          onChange={jest.fn()}
        />,
      );
      await openDisclosureForm('Edit');

      expect(screen.getByRole('textbox', { name: 'Length' })).toHaveValue(
        '50:00',
      );
    });
  });

  it('starts with the current values', async () => {
    render(
      <EditEpisodeForm
        name="Chapitre 1"
        episode={episode}
        onChange={jest.fn()}
      />,
    );
    await openDisclosureForm('Edit');

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
    const { user, save } = await openDisclosureForm('Edit');

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
      const { user, save } = await openDisclosureForm('Edit');

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
