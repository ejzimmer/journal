import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { YarnDraft } from './projectDraft';
import { YarnFields } from './YarnFields';

const RAVELRY_COLOURWAYS = [
  {
    id: 11,
    name: 'Ancient',
    code: '172',
    photoUrl: 'https://images.example/ancient.jpg',
  },
  { id: 12, name: 'Mineral' },
];

function createYarn(ravelryId?: number): YarnDraft {
  return {
    id: 'tweed',
    name: 'Rowan Felted Tweed',
    ...(ravelryId && { ravelryId }),
    colourways: [{ id: 'first', name: '', skeins: '', dyeLot: '' }],
  };
}

function mockRavelryColourways() {
  return jest
    .spyOn(global, 'fetch')
    .mockImplementation(async (url) =>
      String(url).startsWith('/api/ravelry/colourway-colour')
        ? new Response(JSON.stringify({ colour: '#8a7a5c' }))
        : new Response(JSON.stringify({ colourways: RAVELRY_COLOURWAYS })),
    );
}

describe('YarnFields', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the yarn came from Ravelry', () => {
    it('fetches its colourways from Ravelry', async () => {
      const fetchMock = mockRavelryColourways();
      render(<YarnFields yarn={createYarn(42)} onChange={jest.fn()} />);

      await screen.findByRole('combobox', { name: 'Colourway' });

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/ravelry/colourways?yarnId=42',
        expect.anything(),
      );
    });

    describe('and the user opens the colourway list', () => {
      it('shows each colourway with its photo and code', async () => {
        const user = userEvent.setup();
        mockRavelryColourways();
        render(<YarnFields yarn={createYarn(42)} onChange={jest.fn()} />);

        await user.click(
          await screen.findByRole('combobox', { name: 'Colourway' }),
        );

        const ancient = await screen.findByRole('option', {
          name: 'Ancient 172',
        });
        expect(within(ancient).getByRole('presentation')).toHaveAttribute(
          'src',
          'https://images.example/ancient.jpg',
        );
        expect(
          screen.getByRole('option', { name: 'Mineral' }),
        ).toBeInTheDocument();
      });

      describe('then picks one', () => {
        it('sets the colourway name and photo', async () => {
          const user = userEvent.setup();
          mockRavelryColourways();
          const onChange = jest.fn();
          render(<YarnFields yarn={createYarn(42)} onChange={onChange} />);

          await user.click(
            await screen.findByRole('combobox', { name: 'Colourway' }),
          );
          await user.click(
            await screen.findByRole('option', { name: 'Ancient 172' }),
          );

          expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              colourways: [
                expect.objectContaining({
                  name: 'Ancient',
                  photoUrl: 'https://images.example/ancient.jpg',
                }),
              ],
            }),
          );
        });
      });
    });

    describe('and a colourway has a Ravelry photo but no colour yet', () => {
      it('finds the main colour of the photo', async () => {
        const fetchMock = mockRavelryColourways();
        const onChange = jest.fn();
        const yarn = createYarn(42);
        yarn.colourways[0] = {
          ...yarn.colourways[0],
          name: 'Ancient',
          photoUrl: 'https://images.example/ancient.jpg',
        };
        render(<YarnFields yarn={yarn} onChange={onChange} />);

        await waitFor(() =>
          expect(onChange).toHaveBeenLastCalledWith(
            expect.objectContaining({
              colourways: [
                expect.objectContaining({
                  name: 'Ancient',
                  colour: '#8a7a5c',
                }),
              ],
            }),
          ),
        );
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/ravelry/colourway-colour?photoUrl=https%3A%2F%2Fimages.example%2Fancient.jpg',
          expect.anything(),
        );
      });
    });

    describe('and the user types a colourway Ravelry doesn’t list', () => {
      it('keeps the typed name', async () => {
        const user = userEvent.setup();
        mockRavelryColourways();
        const onChange = jest.fn();
        render(<YarnFields yarn={createYarn(42)} onChange={onChange} />);

        await user.type(
          await screen.findByRole('combobox', { name: 'Colourway' }),
          'Seconds',
        );

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            colourways: [expect.objectContaining({ name: 'Seconds' })],
          }),
        );
      });
    });
  });

  describe('when the user changes the yarn', () => {
    it('drops the colourway photos from the old yarn', async () => {
      const user = userEvent.setup();
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(new Response(JSON.stringify({ colourways: [] })));
      const onChange = jest.fn();
      const yarn = createYarn(42);
      yarn.colourways[0] = {
        ...yarn.colourways[0],
        name: 'Ancient',
        photoUrl: 'https://images.example/ancient.jpg',
      };
      render(<YarnFields yarn={yarn} onChange={onChange} />);

      await user.type(screen.getByRole('combobox', { name: 'Yarn name' }), 's');

      const [{ colourways }] = onChange.mock.lastCall;
      expect(colourways[0]).toEqual(
        expect.objectContaining({
          name: 'Ancient',
          photoUrl: undefined,
          colour: undefined,
        }),
      );
    });
  });

  describe('when the yarn didn’t come from Ravelry', () => {
    it('has a plain text colourway field', () => {
      render(<YarnFields yarn={createYarn()} onChange={jest.fn()} />);

      expect(
        screen.getByRole('textbox', { name: 'Colourway' }),
      ).toBeInTheDocument();
    });
  });
});
