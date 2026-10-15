import { findReadingPosition } from './findReadingPosition';
import { getItemsByNumber } from './lists';
import { getReadings } from './getReadings';
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
    return getReadings(volume).flatMap((reading) =>
      reading.understood === undefined
        ? []
        : [
            {
              key: reading.id,
              limbKey: `${volume.id}-limb`,
              at: findReadingPosition(volume, reading, progress),
              understood: reading.understood,
            },
          ],
    );
  });
}
