import { render, screen } from '@testing-library/react';
import { EditSeasonForm } from './EditSeasonForm';
import { openDisclosureForm } from './disclosureFormTestUtils';

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
    const { user, save } = await openDisclosureForm('Edit');

    await user.clear(screen.getByRole('spinbutton', { name: 'Number' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Number' }), '3');
    await save();

    expect(onChange).toHaveBeenCalledWith({ number: 3 });
  });
});
