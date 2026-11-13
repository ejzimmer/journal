export const ARROW_CAPACITIES = [30, 60, 99];
export const BOMB_CAPACITIES = [30, 60, 99];
export const WALLET_CAPACITIES = [200, 1000, 5000];

export function findCapacityLevel(capacities: number[], capacity: number) {
  return capacities.filter((levelCapacity) => levelCapacity <= capacity).length;
}

export function findLevelCapacity(capacities: number[], level: number) {
  return level === 0 ? 0 : capacities[level - 1];
}
