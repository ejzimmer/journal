import { render, screen } from '@testing-library/react';
import { EditVolumeForm } from './EditVolumeForm';
import { openDisclosureForm } from './disclosureFormTestUtils';
import { Volume } from './types';

describe('EditVolumeForm', () => {
  const volume: Volume = {
    id: 'vol1',
    number: 1,
    name: 'Astérix le Gaulois',
    pages: 48,
    lookups: 0,
    aiQuestions: 0,
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
    const { user, save } = await openDisclosureForm('Edit');

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
      const { user, save } = await openDisclosureForm('Edit');

      await user.clear(screen.getByRole('textbox', { name: 'Name' }));
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
