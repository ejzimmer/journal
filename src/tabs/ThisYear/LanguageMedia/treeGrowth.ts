import { listByNumber } from './lists';
import { ShapeGrowth, TreeLayout } from './treeLayout';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

const clampFraction = (value: number) => Math.min(1, Math.max(0, value));

export function measureShapeGrowth(growth: ShapeGrowth, progress: number[]) {
  if (growth.type === 'trunk') {
    const lastStarted = progress.findLastIndex((amount) => amount > 0);
    return lastStarted === -1 ? 0 : growth.levelEnds[lastStarted];
  }
  const { level, start, end } = growth;
  return clampFraction(((progress[level] ?? 0) - start) / (end - start));
}

export function listGrownShapes(layout: TreeLayout, series: PrintSeries) {
  const progress = listByNumber(series.volumes).map((volume) =>
    readVolumeProgress(series, volume),
  );
  return layout.shapes
    .map((shape) => ({
      ...shape,
      amount: measureShapeGrowth(shape.growth, progress),
    }))
    .filter(({ amount }) => amount > 0);
}

export type GrownShape = ReturnType<typeof listGrownShapes>[number];
