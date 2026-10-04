import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguageMediaStorage } from './languageMediaStorageTestUtils';
import { MediaTree } from './MediaTree';
import { PrintSeries, Volume } from './types';

const createVolume = (number: number, name: string): Volume => ({
  id: `vol${number}`,
  number,
  name,
  pages: 200,
  lookups: 0,
  aiQuestions: 0,
});

const createSeries = (type: PrintSeries['type']): PrintSeries => ({
  id: 'series',
  type,
  name: 'Series',
  language: 'french',
  volumes: {
    vol1: createVolume(1, 'Fantine'),
    vol2: createVolume(2, 'Cosette'),
  },
});

describe('MediaTree', () => {
  describe('for a book series', () => {
    it('names each branch after its volume', () => {
      renderWithLanguageMediaStorage(
        <MediaTree series={createSeries('book')} />,
      );

      expect(screen.getByText('Fantine')).toBeInTheDocument();
      expect(screen.getByText('Cosette')).toBeInTheDocument();
    });
  });

  describe('for a manga series', () => {
    it('leaves the branches unnamed', () => {
      renderWithLanguageMediaStorage(
        <MediaTree series={createSeries('manga')} />,
      );

      expect(screen.queryByText('Fantine')).not.toBeInTheDocument();
    });
  });

  describe('clicking the signpost', () => {
    it('opens a form to track the current volume', async () => {
      const user = userEvent.setup();
      renderWithLanguageMediaStorage(
        <MediaTree
          series={{ ...createSeries('book'), upTo: { volume: 2, page: 5 } }}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Series' }));

      expect(
        screen.getByRole('form', { name: 'Track Cosette' }),
      ).toBeInTheDocument();
    });

    describe('when the form is submitted', () => {
      it('closes the form', async () => {
        const user = userEvent.setup();
        renderWithLanguageMediaStorage(
          <MediaTree series={createSeries('book')} />,
        );
        await user.click(screen.getByRole('button', { name: 'Series' }));
        const form = screen.getByRole('form', { name: 'Track Fantine' });

        await user.type(
          screen.getByRole('spinbutton', { name: 'Looked up' }),
          '{Enter}',
        );

        expect(form).not.toBeInTheDocument();
      });
    });
  });
});
