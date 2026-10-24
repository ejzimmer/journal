import { BookDetails, SeriesDetails } from '../types';
import { getSeriesBandKey } from './getSeriesBandKey';

const stationEleven: BookDetails = {
  id: 'book-station-eleven',
  type: 'book',
  title: 'Station Eleven',
};
const glassHotel: BookDetails = {
  id: 'book-glass-hotel',
  type: 'book',
  title: 'The Glass Hotel',
};

const createSeries = (...books: BookDetails[]): SeriesDetails<BookDetails> => ({
  id: 'series-station-eleven',
  type: 'series',
  name: 'Station Eleven',
  items: Object.fromEntries(books.map((book) => [book.id, book])),
});

describe('getSeriesBandKey', () => {
  describe('when no book in the series has an author', () => {
    it('uses the series id', () => {
      const series = createSeries(stationEleven, glassHotel);

      expect(getSeriesBandKey(series)).toBe(series.id);
    });
  });

  describe('when a book in the series has an author', () => {
    it('uses that author', () => {
      const series = createSeries(stationEleven, {
        ...glassHotel,
        author: 'Emily St. John Mandel',
      });

      expect(getSeriesBandKey(series)).toBe('Emily St. John Mandel');
    });
  });

  describe('when books in the series have different authors', () => {
    it('uses the author of the earliest book in the series', () => {
      const series = createSeries(
        { ...glassHotel, author: 'Second Author', position: 1 },
        { ...stationEleven, author: 'First Author', position: 0 },
      );

      expect(getSeriesBandKey(series)).toBe('First Author');
    });
  });
});
