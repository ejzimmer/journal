import { Recipient, SockNumbers } from './types';

type SizeMeasurements = { circumferenceCm: number; lengthMm: number };

export const SIZE_TABLE: Record<number, SizeMeasurements> = {
  35: { circumferenceCm: 17.75, lengthMm: 213 },
  36: { circumferenceCm: 17.75, lengthMm: 225 },
  37: { circumferenceCm: 17.75, lengthMm: 230 },
  38: { circumferenceCm: 20.25, lengthMm: 235 },
  39: { circumferenceCm: 20.25, lengthMm: 246 },
  40: { circumferenceCm: 20.25, lengthMm: 254 },
  41: { circumferenceCm: 23, lengthMm: 257 },
  42: { circumferenceCm: 23, lengthMm: 260 },
  43: { circumferenceCm: 23, lengthMm: 267 },
  44: { circumferenceCm: 25.4, lengthMm: 273 },
  45: { circumferenceCm: 25.4, lengthMm: 279 },
  46: { circumferenceCm: 25.4, lengthMm: 282 },
  47: { circumferenceCm: 25.4, lengthMm: 286 },
};

const TABLE_SIZES = Object.keys(SIZE_TABLE).map(Number);

export const PLANNER_STITCHES_PER_10CM = 31.25;

function findSizeMeasurements(euSize: number) {
  const tableSize = Math.max(
    TABLE_SIZES[0],
    ...TABLE_SIZES.filter((size) => size <= euSize),
  );
  return SIZE_TABLE[tableSize];
}

function roundToMultipleOfFour(stitches: number) {
  return Math.round(stitches / 4) * 4;
}

function roundToOneDecimal(millimetres: number) {
  return Math.round(millimetres * 10) / 10;
}

function calculateStartToeAt(lengthMm: number) {
  return roundToOneDecimal(lengthMm * 0.9 - 4);
}

export function calculateSockNumbers(
  { euSize, overrides = {} }: Recipient,
  stitchesPer10cm = PLANNER_STITCHES_PER_10CM,
): SockNumbers {
  const { circumferenceCm, lengthMm: tableLengthMm } =
    findSizeMeasurements(euSize);
  const lengthMm = overrides.lengthMm ?? tableLengthMm;
  const castOnAtPlannerGauge =
    overrides.castOnStitches ??
    (circumferenceCm * PLANNER_STITCHES_PER_10CM) / 10;

  return {
    lengthMm,
    castOnStitches: roundToMultipleOfFour(
      (castOnAtPlannerGauge * stitchesPer10cm) / PLANNER_STITCHES_PER_10CM,
    ),
    startToeAtMm: overrides.startToeAtMm ?? calculateStartToeAt(lengthMm),
  };
}

export function calculateDefaultSockNumber(
  recipient: Recipient,
  field: keyof SockNumbers,
) {
  const otherOverrides = Object.fromEntries(
    Object.entries(recipient.overrides ?? {}).filter(([key]) => key !== field),
  );
  return calculateSockNumbers({ ...recipient, overrides: otherOverrides })[
    field
  ];
}
