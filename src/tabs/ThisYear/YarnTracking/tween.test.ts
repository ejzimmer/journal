import {
  advanceTween,
  createTween,
  finishTween,
  getTweenValue,
  isTweenRunning,
  retargetTween,
} from './tween';

describe('tween', () => {
  describe('when it is created', () => {
    it('sits still at its value', () => {
      const tween = createTween(2, 0.5);

      expect(getTweenValue(tween)).toBe(2);
      expect(isTweenRunning(tween)).toBe(false);
    });
  });

  describe('when it is given a new target', () => {
    const startTween = () => retargetTween(createTween(0, 1), 1);

    it('starts from where it was', () => {
      const tween = startTween();

      expect(getTweenValue(tween)).toBe(0);
      expect(isTweenRunning(tween)).toBe(true);
    });

    it('covers more than half the distance in the first half of the time', () => {
      const tween = advanceTween(startTween(), 0.5);

      expect(getTweenValue(tween)).toBeGreaterThan(0.5);
      expect(getTweenValue(tween)).toBeLessThan(1);
    });

    it('reaches the target once its time is up', () => {
      const tween = advanceTween(startTween(), 2);

      expect(getTweenValue(tween)).toBe(1);
      expect(isTweenRunning(tween)).toBe(false);
    });

    it('jumps to the target when finished early', () => {
      const tween = finishTween(startTween());

      expect(getTweenValue(tween)).toBe(1);
      expect(isTweenRunning(tween)).toBe(false);
    });

    describe('while it is already moving', () => {
      it('carries on from its current value', () => {
        const moving = advanceTween(startTween(), 0.5);
        const current = getTweenValue(moving);

        const retargeted = retargetTween(moving, 0);

        expect(getTweenValue(retargeted)).toBe(current);
        expect(getTweenValue(advanceTween(retargeted, 1))).toBe(0);
      });
    });
  });

  describe('when it is given the target it already has', () => {
    it('keeps going without restarting', () => {
      const moving = advanceTween(retargetTween(createTween(0, 1), 1), 0.5);

      expect(retargetTween(moving, 1)).toBe(moving);
    });
  });
});
