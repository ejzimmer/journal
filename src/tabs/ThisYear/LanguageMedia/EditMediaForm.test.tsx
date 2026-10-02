import { render, screen } from '@testing-library/react';
import { EditMediaForm } from './EditMediaForm';
import { openDisclosureForm } from './disclosureFormTestUtils';
import { TvSeries } from './types';

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
    const { user, save } = await openDisclosureForm('Edit');

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
    const { save } = await openDisclosureForm('Edit');
    const details = screen.getByRole('group');

    await save();

    expect(details).not.toHaveAttribute('open');
  });

  describe('without a name', () => {
    it('does not save', async () => {
      const onChange = jest.fn();
      render(<EditMediaForm media={lupin} onChange={onChange} />);
      const { user, save } = await openDisclosureForm('Edit');

      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
