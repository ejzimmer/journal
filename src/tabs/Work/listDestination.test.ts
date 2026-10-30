import { getDestinationListIndex } from './listDestination';

describe('getDestinationListIndex', () => {
  describe('when the destination is inside the list', () => {
    it("returns the previous index for 'previous'", () => {
      expect(getDestinationListIndex(2, 5, 'previous')).toBe(1);
    });

    it("returns the next index for 'next'", () => {
      expect(getDestinationListIndex(2, 5, 'next')).toBe(3);
    });

    it("returns 0 for 'first'", () => {
      expect(getDestinationListIndex(2, 5, 'first')).toBe(0);
    });

    it("returns the last index for 'last'", () => {
      expect(getDestinationListIndex(2, 5, 'last')).toBe(4);
    });
  });

  describe('when the item is already at the edge of the list', () => {
    it('returns an out-of-bounds index for a move past the start', () => {
      expect(getDestinationListIndex(0, 5, 'previous')).toBe(-1);
    });

    it('returns an out-of-bounds index for a move past the end', () => {
      expect(getDestinationListIndex(4, 5, 'next')).toBe(5);
    });
  });
});
