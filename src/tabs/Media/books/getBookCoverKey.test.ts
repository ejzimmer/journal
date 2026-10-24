import { BookDetails, SeriesDetails } from '../types';
import { getBookCoverKey } from './getBookCoverKey';

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

describe('getBookCoverKey', () => {
  describe('for a single book', () => {
    describe('with an author', () => {
      it('uses the author', () => {
        expect(
          getBookCoverKey({
            ...stationEleven,
            author: 'Emily St. John Mandel',
          }),
        ).toBe('Emily St. John Mandel');
      });
    });

    describe('without an author', () => {
      it('uses the title', () => {
        expect(getBookCoverKey(stationEleven)).toBe('Station Eleven');
      });
    });
  });

  describe('for a book in a series', () => {
    describe('when no book in the series has an author', () => {
      it('uses the series id for every book', () => {
        const series = createSeries(stationEleven, glassHotel);

        expect(getBookCoverKey(stationEleven, series)).toBe(series.id);
        expect(getBookCoverKey(glassHotel, series)).toBe(series.id);
      });
    });

    describe('when only some books have an author', () => {
      it('uses that author for every book', () => {
        const series = createSeries(stationEleven, {
          ...glassHotel,
          author: 'Emily St. John Mandel',
        });

        expect(getBookCoverKey(stationEleven, series)).toBe(
          'Emily St. John Mandel',
        );
        expect(getBookCoverKey(glassHotel, series)).toBe(
          'Emily St. John Mandel',
        );
      });
    });
  });
});
