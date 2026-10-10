import { findBeetlePose } from './findBeetlePose';
import { EdgeSample } from './treeGeometry';

const createBranch = (direction: 1 | -1): EdgeSample[] =>
  Array.from({ length: 11 }, (_, index) => ({
    at: index / 10,
    left: { x: index * 10 * direction, y: 2 },
    right: { x: index * 10 * direction, y: -2 },
  }));

describe('findBeetlePose', () => {
  describe('on a branch growing to the right', () => {
    const branch = createBranch(1);

    describe('when the beetle walks out along the branch', () => {
      const pose = findBeetlePose(branch, 0.5, true);

      it('stands it on top of the branch', () => {
        expect(pose.x).toBeCloseTo(50);
        expect(pose.y).toBeCloseTo(-1.6);
      });

      it('faces it along the branch the right way up', () => {
        expect(pose.heading).toBe(0);
        expect(pose.isUpsideDown).toBe(false);
      });
    });

    describe('when the beetle walks back towards the trunk', () => {
      const pose = findBeetlePose(branch, 0.5, false);

      it('turns it around and flips it so it stays the right way up', () => {
        expect(pose.heading).toBe(180);
        expect(pose.isUpsideDown).toBe(true);
      });
    });
  });

  describe('on a branch growing to the left', () => {
    it('still stands the beetle on top of the branch', () => {
      expect(findBeetlePose(createBranch(-1), 0.5, true).y).toBeCloseTo(-1.6);
    });
  });
});
