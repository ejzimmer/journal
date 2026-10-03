import { PieceGrowth } from './treeLayout';

const clampFraction = (value: number) => Math.min(1, Math.max(0, value));

export function measurePieceGrowth(growth: PieceGrowth, progress: number[]) {
  if (growth.type === 'trunk') {
    return progress.slice(growth.level).some((amount) => amount > 0) ? 1 : 0;
  }
  const { level, start, end } = growth;
  return clampFraction(((progress[level] ?? 0) - start) / (end - start));
}
