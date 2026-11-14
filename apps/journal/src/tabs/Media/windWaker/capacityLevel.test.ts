import {
  WALLET_CAPACITIES,
  findCapacityLevel,
  findLevelCapacity,
} from './capacityLevel';

describe('findCapacityLevel', () => {
  describe('with a capacity that matches an upgrade', () => {
    it('returns the number of upgrades up to and including it', () => {
      expect(findCapacityLevel(WALLET_CAPACITIES, 1000)).toBe(2);
    });
  });

  describe('with a capacity between upgrades', () => {
    it('returns the upgrades below it', () => {
      expect(findCapacityLevel(WALLET_CAPACITIES, 500)).toBe(1);
    });
  });

  describe('with no capacity', () => {
    it('returns 0', () => {
      expect(findCapacityLevel(WALLET_CAPACITIES, 0)).toBe(0);
    });
  });
});

describe('findLevelCapacity', () => {
  describe('at an upgrade level', () => {
    it('returns that upgrade capacity', () => {
      expect(findLevelCapacity(WALLET_CAPACITIES, 3)).toBe(5000);
    });
  });

  describe('at level 0', () => {
    it('returns 0', () => {
      expect(findLevelCapacity(WALLET_CAPACITIES, 0)).toBe(0);
    });
  });
});
