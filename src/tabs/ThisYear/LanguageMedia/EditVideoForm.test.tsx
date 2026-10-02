import { render, screen } from '@testing-library/react';
import { EditVideoForm } from './EditVideoForm';
import { openDisclosureForm } from './disclosureFormTestUtils';
import { Video } from './types';

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
    const { user, save } = await openDisclosureForm('Edit');

    await user.clear(screen.getByRole('textbox', { name: 'URL' }));
    await user.type(
      screen.getByRole('textbox', { name: 'URL' }),
      'https://youtu.be/2',
    );
    await user.type(screen.getByRole('textbox', { name: 'Hours' }), '1');
    await user.type(screen.getByRole('textbox', { name: 'Minutes' }), '2');
    await user.type(screen.getByRole('textbox', { name: 'Seconds' }), '5');
    await save();

    expect(onChange).toHaveBeenCalledWith({
      url: 'https://youtu.be/2',
      lengthInSeconds: 3725,
    });
  });
});
