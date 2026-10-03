import { listByNumber } from './lists';
import { PieceGrowth, TreeLayout } from './treeLayout';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

const clampFraction = (value: number) => Math.min(1, Math.max(0, value));

export function measurePieceGrowth(growth: PieceGrowth, progress: number[]) {
  if (growth.type === 'trunk') {
    return progress.slice(growth.level).some((amount) => amount > 0) ? 1 : 0;
  }
  const { level, start, end } = growth;
  return clampFraction(((progress[level] ?? 0) - start) / (end - start));
}

export function measureTreeGrowth(layout: TreeLayout, series: PrintSeries) {
  const progress = listByNumber(series.volumes).map((volume) =>
    readVolumeProgress(series, volume),
  );
  return layout.pieces.map((piece) => ({
    ...piece,
    amount: measurePieceGrowth(piece.growth, progress),
  }));
}

export type GrownPiece = ReturnType<typeof measureTreeGrowth>[number];
