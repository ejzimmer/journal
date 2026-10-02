import { render, screen } from '@testing-library/react';
import { VideoUpToForm } from './VideoUpToForm';
import { openDisclosureForm } from './disclosureFormTestUtils';

describe('VideoUpToForm', () => {
  it('saves the timestamp', async () => {
    const onChange = jest.fn();
    render(<VideoUpToForm name="https://youtu.be/1" onChange={onChange} />);
    const { user, save } = await openDisclosureForm('Update');

    await user.type(screen.getByRole('textbox', { name: 'Minutes' }), '20');
    await save();

    expect(onChange).toHaveBeenCalledWith(1200);
  });
});
