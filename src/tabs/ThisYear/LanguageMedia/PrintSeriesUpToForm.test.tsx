import { render, screen } from '@testing-library/react';
import { PrintSeriesUpToForm } from './PrintSeriesUpToForm';
import { openDisclosureForm } from './disclosureFormTestUtils';

describe('PrintSeriesUpToForm', () => {
  it('saves the volume, chapter and page', async () => {
    const onChange = jest.fn();
    render(<PrintSeriesUpToForm upTo={undefined} onChange={onChange} />);
    const { user, save } = await openDisclosureForm('Update');

    await user.type(screen.getByRole('spinbutton', { name: 'Volume' }), '1');
    await user.type(screen.getByRole('spinbutton', { name: 'Chapter' }), '2');
    await user.type(screen.getByRole('spinbutton', { name: 'Page' }), '41');
    await save();

    expect(onChange).toHaveBeenCalledWith({ volume: 1, chapter: 2, page: 41 });
  });
});
