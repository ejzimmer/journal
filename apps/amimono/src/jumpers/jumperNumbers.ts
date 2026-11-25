import {
  EvenShaping,
  planEvenShaping,
  planTwoRateShaping,
  ShapingRate,
} from './shaping';
import { EasedMeasurement, JumperInputs } from './types';

export const RIBBING_CM = 5;
export const FRONT_NECK_DEPTH_CM = 9;
const STRAIGHT_AFTER_RIBBING_CM = 5;
const FIRST_ARMHOLE_BIND_OFF_CM = 2.5;
const SECOND_ARMHOLE_BIND_OFF_CM = 1.25;
const SHOULDER_ROWS_ON_NECK_SIDE = 2;

export type JumperNumbers = {
  castOnStitches: number;
  straightCm: number;
  waistStitches: number;
  waistShaping?: EvenShaping;
  bustStitches: number;
  bustRows: number;
  bustShaping: ShapingRate[];
  armholeBindOffs: [number, number];
  armholeDecreaseRows: number;
  crossChestStitches: number;
  lengthToShouldersCm: number;
  shoulderStitches: number;
  shoulderShortRowStitches: number;
  frontNeckStartCm: number;
  frontNeckBindOff: number;
  frontNeckDecreasesEveryRow: number;
  frontNeckDecreasesEverySecondRow: number;
};

function addEase({ cm, source, easeCm = 0 }: EasedMeasurement) {
  return source === 'body' ? cm + easeCm : cm;
}

function roundToNearestMultiple(value: number, multiple: number) {
  return Math.round(value / multiple) * multiple;
}

function roundUpToMultiple(value: number, multiple: number) {
  return Math.ceil(value / multiple) * multiple;
}

export function calculateJumperNumbers(inputs: JumperInputs): JumperNumbers {
  const stitchesPerCm = inputs.gauge.stitches / 10;
  const rowsPerCm = inputs.gauge.rows / 10;
  const convertCmToStitches = (cm: number) => cm * stitchesPerCm;
  const convertCmToRows = (cm: number) => Math.round(cm * rowsPerCm);

  const castOnStitches = roundToNearestMultiple(
    convertCmToStitches(addEase(inputs.hips) / 2),
    4,
  );
  const waistStitches = roundUpToMultiple(
    convertCmToStitches(addEase(inputs.waist) / 2),
    2,
  );
  const waistShapingRows = convertCmToRows(
    inputs.waistToHip - RIBBING_CM - STRAIGHT_AFTER_RIBBING_CM,
  );
  const waistDecreaseRows = (castOnStitches - waistStitches) / 2;
  const waistShaping =
    waistDecreaseRows > 0
      ? planEvenShaping(waistShapingRows, waistDecreaseRows)
      : undefined;
  const spareRows = waistShaping ? waistShaping.spareRows : waistShapingRows;

  const bustStitches = roundToNearestMultiple(
    convertCmToStitches(addEase(inputs.bust) / 2),
    2,
  );
  const bustRows = convertCmToRows(inputs.hemToArmhole - inputs.waistToHip);
  const bustIncreaseRows = (bustStitches - waistStitches) / 2;

  const armholeBindOffs: [number, number] = [
    Math.round(convertCmToStitches(FIRST_ARMHOLE_BIND_OFF_CM)),
    Math.round(convertCmToStitches(SECOND_ARMHOLE_BIND_OFF_CM)),
  ];
  const crossChestStitches = roundToNearestMultiple(
    convertCmToStitches(inputs.crossChest),
    2,
  );
  const stitchesAfterBindOffs =
    bustStitches - 2 * (armholeBindOffs[0] + armholeBindOffs[1]);

  const neckStitches = roundToNearestMultiple(
    convertCmToStitches(inputs.neckWidth),
    2,
  );
  const shoulderStitches = (crossChestStitches - neckStitches) / 2;
  const lengthToShouldersCm = inputs.hemToArmhole + inputs.armholeDepth;
  const totalLengthCm =
    lengthToShouldersCm + SHOULDER_ROWS_ON_NECK_SIDE / rowsPerCm;

  const neckStitchesPerSide = neckStitches / 2;
  const frontNeckBindOff = Math.ceil(neckStitchesPerSide / 2);
  const frontNeckDecreases = neckStitchesPerSide - frontNeckBindOff;
  const frontNeckDecreasesEveryRow = Math.round((frontNeckDecreases * 2) / 3);

  return {
    castOnStitches,
    straightCm: Math.round(STRAIGHT_AFTER_RIBBING_CM + spareRows / rowsPerCm),
    waistStitches,
    waistShaping,
    bustStitches,
    bustRows,
    bustShaping:
      bustIncreaseRows > 0
        ? planTwoRateShaping(bustRows, bustIncreaseRows)
        : [],
    armholeBindOffs,
    armholeDecreaseRows: Math.max(
      0,
      (stitchesAfterBindOffs - crossChestStitches) / 2,
    ),
    crossChestStitches,
    lengthToShouldersCm: Math.round(lengthToShouldersCm),
    shoulderStitches,
    shoulderShortRowStitches: Math.round(shoulderStitches / 2),
    frontNeckStartCm: Math.round(totalLengthCm - FRONT_NECK_DEPTH_CM),
    frontNeckBindOff,
    frontNeckDecreasesEveryRow,
    frontNeckDecreasesEverySecondRow:
      frontNeckDecreases - frontNeckDecreasesEveryRow,
  };
}
