import { ClassBlock } from '../../shared/types';

export function createClassBlocks(
  count: number,
  total: number,
): ClassBlock[] | undefined {
  if (![count, total].every((value) => Number.isInteger(value) && value > 0)) {
    return;
  }
  return Array.from({ length: count }, () => ({
    id: crypto.randomUUID(),
    total,
  }));
}
