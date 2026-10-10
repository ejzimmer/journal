import { calculateHangArcs } from './deadHang';

describe('calculateHangArcs', () => {
  describe('with no hangs', () => {
    it('has no arcs', () => {
      expect(calculateHangArcs([])).toEqual([]);
    });
  });

  describe('with several hangs', () => {
    it('starts each arc where the one before it ended, as a fraction of a minute', () => {
      expect(calculateHangArcs([15, 6, 9])).toEqual([
        { from: 0, to: 0.25 },
        { from: 0.25, to: 0.35 },
        { from: 0.35, to: 0.5 },
      ]);
    });
  });
});
