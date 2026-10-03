import { measurePieceGrowth } from './treeGrowth';

describe('measurePieceGrowth', () => {
  describe('for a piece of trunk', () => {
    const trunk = { type: 'trunk', level: 1 } as const;

    describe('when a volume at or above its level has started', () => {
      it('is fully grown', () => {
        expect(measurePieceGrowth(trunk, [1, 0, 0.2])).toBe(1);
      });
    });

    describe('when only volumes below its level have started', () => {
      it('has not grown', () => {
        expect(measurePieceGrowth(trunk, [1, 0, 0])).toBe(0);
      });
    });
  });

  describe('for a piece of branch', () => {
    const branch = { type: 'branch', level: 0, start: 0.4, end: 0.6 } as const;

    describe('when the volume is read past its end', () => {
      it('is fully grown', () => {
        expect(measurePieceGrowth(branch, [0.8])).toBe(1);
      });
    });

    describe('when the volume is read partway through it', () => {
      it('grows that far along it', () => {
        expect(measurePieceGrowth(branch, [0.45])).toBeCloseTo(0.25);
      });
    });

    describe('when the volume is not read up to its start', () => {
      it('has not grown', () => {
        expect(measurePieceGrowth(branch, [0.3])).toBe(0);
      });
    });
  });
});
