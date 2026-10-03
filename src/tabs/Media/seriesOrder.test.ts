import { sortSeriesItems } from './seriesOrder';
import { BookDetails } from './types';

const createBook = (id: string, position?: number): BookDetails => ({
  id,
  type: 'book',
  title: id,
  ...(position !== undefined && { position }),
});

const listIds = (items: { id: string }[]) => items.map(({ id }) => id);

describe('sortSeriesItems', () => {
  describe('when every item has a position', () => {
    it('orders the items by position', () => {
      const items = {
        a: createBook('a', 2),
        b: createBook('b', 0),
        c: createBook('c', 1),
      };

      expect(listIds(sortSeriesItems(items))).toEqual(['b', 'c', 'a']);
    });
  });

  describe('when no item has a position', () => {
    it('keeps the stored order', () => {
      const items = { a: createBook('a'), b: createBook('b') };

      expect(listIds(sortSeriesItems(items))).toEqual(['a', 'b']);
    });
  });

  describe('when there are no items', () => {
    it('returns an empty list', () => {
      expect(sortSeriesItems(undefined)).toEqual([]);
    });
  });
});
