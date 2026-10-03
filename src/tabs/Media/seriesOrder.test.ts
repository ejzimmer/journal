import { dropSeriesItem, moveSeriesItem, sortSeriesItems } from './seriesOrder';
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

describe('moveSeriesItem', () => {
  const items = ['a', 'b', 'c', 'd'].map((id) => createBook(id));

  it('swaps an item with the one before it when moved to the previous place', () => {
    expect(listIds(moveSeriesItem(items, 2, 'previous'))).toEqual([
      'a',
      'c',
      'b',
      'd',
    ]);
  });

  it('swaps an item with the one after it when moved to the next place', () => {
    expect(listIds(moveSeriesItem(items, 1, 'next'))).toEqual([
      'a',
      'c',
      'b',
      'd',
    ]);
  });

  it('puts an item first when moved to the start', () => {
    expect(listIds(moveSeriesItem(items, 2, 'start'))).toEqual([
      'c',
      'a',
      'b',
      'd',
    ]);
  });

  it('puts an item last when moved to the end', () => {
    expect(listIds(moveSeriesItem(items, 1, 'end'))).toEqual([
      'a',
      'c',
      'd',
      'b',
    ]);
  });
});

describe('dropSeriesItem', () => {
  const items = ['a', 'b', 'c'].map((id) => createBook(id));

  describe('when dropped on the left edge of another item', () => {
    it('puts the item before it', () => {
      expect(
        listIds(
          dropSeriesItem({ items, itemId: 'c', targetId: 'a', edge: 'left' }),
        ),
      ).toEqual(['c', 'a', 'b']);
    });
  });

  describe('when dropped on the right edge of another item', () => {
    it('puts the item after it', () => {
      expect(
        listIds(
          dropSeriesItem({ items, itemId: 'a', targetId: 'b', edge: 'right' }),
        ),
      ).toEqual(['b', 'a', 'c']);
    });
  });
});
