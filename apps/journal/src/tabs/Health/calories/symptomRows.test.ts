import { splitIntoRows } from './symptomRows';

describe('splitIntoRows', () => {
  describe('given up to two items', () => {
    it('puts them in a single row', () => {
      expect(splitIntoRows(['a', 'b'])).toEqual([['a', 'b']]);
    });
  });

  describe('given three to seven items', () => {
    it.each([
      [3, [2, 1]],
      [4, [3, 1]],
      [5, [3, 2]],
      [6, [3, 3]],
      [7, [2, 3, 2]],
    ])('splits %i items into rows of %j', (count, lengths) => {
      const rows = splitIntoRows(Array.from({ length: count }, (_, i) => i));
      expect(rows.map((row) => row.length)).toEqual(lengths);
    });
  });

  describe('given more items than the curve-following layouts cover', () => {
    it('fills rows of three in order', () => {
      const items = Array.from({ length: 11 }, (_, i) => i);
      expect(splitIntoRows(items)).toEqual([
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [9, 10],
      ]);
    });
  });
});
