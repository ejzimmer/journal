import {
  createPerch,
  createTrunkPerch,
  interleaveColours,
  measureRoom,
  Perch,
  placeOnPerch,
} from './beetlePerches';
import { findReadingPosition } from './findReadingPosition';
import { getReadings } from './getReadings';
import { LadyBeetleColour } from './LadyBeetle';
import { getItemsByNumber } from './lists';
import { BeetleSpot } from './placeBeetles';
import { GrownShape } from './treeGrowth';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

const CLUMPED_BEETLE_ROOM = 5;

type Clump = { key: string; colours: LadyBeetleColour[]; position: number };

function placeClump(perch: Perch, { key, colours, position }: Clump) {
  const [min, max] = perch.range;
  const halfWidth = (colours.length * CLUMPED_BEETLE_ROOM) / perch.length / 2;
  const centre = Math.min(max - halfWidth, Math.max(min + halfWidth, position));
  return placeOnPerch(
    { ...perch, range: [centre - halfWidth, centre + halfWidth], colours },
    `${key}-beetle`,
  );
}

function splitClumps(clumps: Clump[], room: number) {
  let roomLeft = room;
  const fitting: Clump[] = [];
  const overflow: LadyBeetleColour[] = [];
  clumps.forEach((clump) => {
    const colours = clump.colours.slice(0, roomLeft);
    if (colours.length) fitting.push({ ...clump, colours });
    overflow.push(...clump.colours.slice(colours.length));
    roomLeft -= colours.length;
  });
  return { fitting, overflow };
}

export function placeBeetleClumps(
  series: PrintSeries,
  shapes: GrownShape[],
): BeetleSpot[] {
  const trunk = shapes.find(({ key }) => key === 'trunk');
  return getItemsByNumber(series.volumes).flatMap((volume) => {
    const limb = shapes.find(({ key }) => key === `${volume.id}-limb`);
    if (!limb) return [];
    const perch = createPerch(limb);
    const progress = readVolumeProgress(series, volume);
    const clumps = getReadings(volume).map((reading) => ({
      key: reading.id,
      colours: interleaveColours(reading.lookups, reading.aiQuestions),
      position: findReadingPosition(volume, reading, progress),
    }));
    const { fitting, overflow } = splitClumps(
      clumps,
      measureRoom(perch, CLUMPED_BEETLE_ROOM),
    );

    return [
      ...fitting.flatMap((clump) => placeClump(perch, clump)),
      ...(trunk && overflow.length
        ? placeOnPerch(
            createTrunkPerch(trunk, limb, overflow),
            `${volume.id}-trunk-beetle`,
          )
        : []),
    ];
  });
}
