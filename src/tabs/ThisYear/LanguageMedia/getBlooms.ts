import { calculateUpdatePosition } from './calculateUpdatePosition';
import { getItemsByNumber } from './lists';
import { getProgressUpdates } from './getProgressUpdates';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

export type Bloom = {
  key: string;
  limbKey: string;
  at: number;
  understood: number;
};

export function getBlooms(series: PrintSeries): Bloom[] {
  return getItemsByNumber(series.volumes).flatMap((volume) => {
    const progress = readVolumeProgress(series, volume);
    return getProgressUpdates(volume).flatMap((update) =>
      update.understood === undefined
        ? []
        : [
            {
              key: update.key,
              limbKey: `${volume.id}-limb`,
              at: calculateUpdatePosition(volume, update, progress),
              understood: update.understood,
            },
          ],
    );
  });
}
