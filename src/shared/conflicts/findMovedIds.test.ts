import { findMovedIds } from './findMovedIds';

describe('findMovedIds', () => {
  describe('when the orders match', () => {
    it('finds nothing moved', () => {
      expect(findMovedIds(['a', 'b', 'c'], ['a', 'b', 'c'])).toEqual(new Set());
    });
  });

  describe('when one item moved up', () => {
    it('finds only that item, not the ones it pushed down', () => {
      expect(findMovedIds(['d', 'a', 'b', 'c'], ['a', 'b', 'c', 'd'])).toEqual(
        new Set(['d']),
      );
    });
  });

  describe('when one item moved down', () => {
    it('finds only that item, not the ones that moved up past it', () => {
      expect(findMovedIds(['b', 'c', 'd', 'a'], ['a', 'b', 'c', 'd'])).toEqual(
        new Set(['a']),
      );
    });
  });

  describe('when two items moved', () => {
    it('finds both', () => {
      expect(
        findMovedIds(['e', 'a', 'c', 'd', 'b'], ['a', 'b', 'c', 'd', 'e']),
      ).toEqual(new Set(['e', 'b']));
    });
  });

  describe('when an item is only in my order', () => {
    it('counts it as moved', () => {
      expect(findMovedIds(['a', 'new', 'b'], ['a', 'b'])).toEqual(
        new Set(['new']),
      );
    });
  });
});
