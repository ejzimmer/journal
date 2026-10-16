import {
  BASE_GAP,
  createPerch,
  createTrunkPerch,
  interleaveColours,
  measureRoom,
  Perch,
  placeOnPerch,
} from './beetlePerches';
import { findUpdatePosition } from './findUpdatePosition';
import { getProgressUpdates } from './getProgressUpdates';
import { LadyBeetleColour } from './LadyBeetle';
import { getItemsByNumber } from './lists';
import { BeetleSpot } from './placeBeetles';
import { GrownShape } from './treeGrowth';
import { PrintSeries, Volume } from './types';
import { readVolumeProgress } from './volumeProgress';

const SCATTERED_BEETLE_ROOM = 6;

type Stretch = { key: string; perch: Perch; colours: LadyBeetleColour[] };

function createStretches(
  series: PrintSeries,
  volume: Volume,
  limb: GrownShape,
): Stretch[] {
  const limbPerch = createPerch(limb);
  const [limbStart, limbEnd] = limbPerch.range;
  const progress = readVolumeProgress(series, volume);
  let start = BASE_GAP;
  return getProgressUpdates(volume).map((update) => {
    const end = Math.min(
      limbEnd,
      Math.max(start, findUpdatePosition(volume, update, progress)),
    );
    const stretch = {
      key: update.key,
      perch: { ...limbPerch, range: [Math.max(limbStart, start), end] },
      colours: interleaveColours(update.lookups, update.aiQuestions),
    } satisfies Stretch;
    start = end;
    return stretch;
  });
}

function fillStretch({ key, perch, colours }: Stretch) {
  const room = measureRoom(perch, SCATTERED_BEETLE_ROOM);
  return {
    spots: placeOnPerch(
      { ...perch, colours: colours.slice(0, room) },
      `${key}-beetle`,
    ),
    overflow: colours.slice(room),
  };
}

export function placeProgressBeetles(
  series: PrintSeries,
  shapes: GrownShape[],
): BeetleSpot[] {
  const trunk = shapes.find(({ key }) => key === 'trunk');
  return getItemsByNumber(series.volumes).flatMap((volume) => {
    const limb = shapes.find(({ key }) => key === `${volume.id}-limb`);
    if (!limb) return [];
    const filled = createStretches(series, volume, limb).map(fillStretch);
    const overflow = filled.flatMap((stretch) => stretch.overflow);

    return [
      ...filled.flatMap(({ spots }) => spots),
      ...(trunk && overflow.length
        ? placeOnPerch(
            createTrunkPerch(trunk, limb, overflow),
            `${volume.id}-trunk-beetle`,
          )
        : []),
    ];
  });
}
