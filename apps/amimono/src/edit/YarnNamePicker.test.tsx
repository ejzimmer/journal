import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { YarnNamePicker } from './YarnNamePicker';

const RAVELRY_YARNS = [
  { id: 1, name: 'Malabrigo Rios' },
  { id: 2, name: 'Malabrigo Mechita' },
];

function mockRavelrySearch() {
  return jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify({ yarns: RAVELRY_YARNS })));
}

describe('YarnNamePicker', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the user types a yarn name', () => {
    it('searches Ravelry and lists the matching yarns', async () => {
      const user = userEvent.setup();
      const fetchMock = mockRavelrySearch();
      render(<YarnNamePicker name="" onChange={jest.fn()} />);

      await user.type(screen.getByRole('combobox'), 'mala');

      expect(
        (await screen.findAllByRole('option')).map(
          (option) => option.textContent,
        ),
      ).toEqual(['Malabrigo Rios', 'Malabrigo Mechita']);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ravelry/yarns?query=mala',
        expect.anything(),
      );
    });

    it('keeps the typed name without a Ravelry yarn', async () => {
      const user = userEvent.setup();
      mockRavelrySearch();
      const onChange = jest.fn();
      render(<YarnNamePicker name="" onChange={onChange} />);

      await user.type(screen.getByRole('combobox'), 'Grandma');

      expect(onChange).toHaveBeenLastCalledWith({ name: 'Grandma' });
    });

    describe('and picks a Ravelry yarn', () => {
      it('saves its name and Ravelry id', async () => {
        const user = userEvent.setup();
        mockRavelrySearch();
        const onChange = jest.fn();
        render(<YarnNamePicker name="" onChange={onChange} />);

        await user.type(screen.getByRole('combobox'), 'mala');
        await user.click(
          await screen.findByRole('option', { name: 'Malabrigo Rios' }),
        );

        expect(onChange).toHaveBeenLastCalledWith({
          name: 'Malabrigo Rios',
          ravelryId: 1,
        });
      });
    });

    describe('and Ravelry can’t be reached', () => {
      it('still keeps the typed name', async () => {
        const user = userEvent.setup();
        jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('offline'));
        const onChange = jest.fn();
        render(<YarnNamePicker name="" onChange={onChange} />);

        await user.type(screen.getByRole('combobox'), 'Rios');

        expect(onChange).toHaveBeenLastCalledWith({ name: 'Rios' });
      });
    });
  });

  describe('when the user clears a Ravelry yarn', () => {
    it('clears the name and the Ravelry id', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <YarnNamePicker
          name="Malabrigo Rios"
          ravelryId={1}
          onChange={onChange}
        />,
      );

      await user.clear(screen.getByRole('combobox'));

      expect(onChange).toHaveBeenLastCalledWith({ name: '' });
    });
  });
});
