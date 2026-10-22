import { findArcPosition } from './findArcPosition';

describe('findArcPosition', () => {
  describe('for a body that rises and sets on the same day', () => {
    it('starts on the horizon at the left when it rises', () => {
      expect(findArcPosition(6, 6, 19)).toEqual({ across: 0, height: 0 });
    });

    it('is at the top of the sky halfway between rising and setting', () => {
      expect(findArcPosition(12.5, 6, 19)).toEqual({ across: 0.5, height: 1 });
    });

    it('is back on the horizon at the right when it sets', () => {
      expect(findArcPosition(19, 6, 19)?.across).toBe(1);
      expect(findArcPosition(19, 6, 19)?.height).toBeCloseTo(0);
    });

    it('is nowhere while it is down', () => {
      expect(findArcPosition(22, 6, 19)).toBeUndefined();
    });
  });

  describe('for a body that sets the day after it rises', () => {
    it('is at the top of the sky halfway through the night', () => {
      expect(findArcPosition(0.5, 19, 6)).toEqual({ across: 0.5, height: 1 });
    });

    it('is nowhere during the day', () => {
      expect(findArcPosition(12, 19, 6)).toBeUndefined();
    });
  });
});
