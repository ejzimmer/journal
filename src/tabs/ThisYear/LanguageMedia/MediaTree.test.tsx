import { render, screen } from '@testing-library/react';
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
      render(<MediaTree series={createSeries('book')} />);

      expect(screen.getByText('Fantine')).toBeInTheDocument();
      expect(screen.getByText('Cosette')).toBeInTheDocument();
    });
  });

  describe('for a manga series', () => {
    it('leaves the branches unnamed', () => {
      render(<MediaTree series={createSeries('manga')} />);

      expect(screen.queryByText('Fantine')).not.toBeInTheDocument();
    });
  });
});
