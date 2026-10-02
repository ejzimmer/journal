import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddVolumeForm } from './AddVolumeForm';

describe('AddVolumeForm', () => {
  describe('when the name is optional', () => {
    it('adds the next volume without one', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(
        <AddVolumeForm
          volumes={{ vol1: { id: 'vol1', number: 1 } }}
          isNameRequired={false}
          onAdd={onAdd}
        />,
      );

      await user.type(screen.getByRole('spinbutton', { name: 'Pages' }), '180');
      await user.click(screen.getByRole('button', { name: 'Add volume' }));

      expect(onAdd).toHaveBeenCalledWith({ number: 2, pages: 180 });
    });
  });

  describe('when the name is required', () => {
    it('adds the volume with its name', async () => {
      const user = userEvent.setup();
      const onAdd = jest.fn();
      render(<AddVolumeForm isNameRequired onAdd={onAdd} />);

      await user.type(
        screen.getByRole('textbox', { name: 'Name' }),
        'Astérix le Gaulois',
      );
      await user.click(screen.getByRole('button', { name: 'Add volume' }));

      expect(onAdd).toHaveBeenCalledWith({
        number: 1,
        name: 'Astérix le Gaulois',
      });
    });

    describe('and missing', () => {
      it('does not add the volume', async () => {
        const user = userEvent.setup();
        const onAdd = jest.fn();
        render(<AddVolumeForm isNameRequired onAdd={onAdd} />);

        await user.click(screen.getByRole('button', { name: 'Add volume' }));

        expect(onAdd).not.toHaveBeenCalled();
      });
    });
  });
});
