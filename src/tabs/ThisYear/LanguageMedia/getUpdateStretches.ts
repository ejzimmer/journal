import { calculateUpdatePosition } from './calculateUpdatePosition';
import { getProgressUpdates } from './getProgressUpdates';
import { getItemsByNumber } from './lists';
import { sliceEdges } from './sliceEdges';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { PrintSeries, Volume } from './types';
import { readVolumeProgress } from './volumeProgress';

const MIN_STRETCH = 0.02;

export type UpdateStretch = {
  key: string;
  volume: Volume;
  edges: EdgeSample[];
};

export function getUpdateStretches(
  series: PrintSeries,
  shapes: GrownShape[],
): UpdateStretch[] {
  return getItemsByNumber(series.volumes).flatMap((volume) => {
    const limb = shapes.find(({ key }) => key === `${volume.id}-limb`);
    if (!limb) return [];
    const progress = readVolumeProgress(series, volume);
    const ends = getProgressUpdates(volume).map((update) => ({
      key: update.key,
      at: calculateUpdatePosition(volume, update, progress),
    }));
    return ends.map(({ key, at }, index) => {
      const from = index === 0 ? 0 : ends[index - 1].at;
      return {
        key,
        volume,
        edges: sliceEdges(limb.edges, from, Math.max(at, from + MIN_STRETCH)),
      };
    });
  });
}
