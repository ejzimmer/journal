import {
  addEase,
  JumperNumbers,
  roundToNearestMultiple,
} from './jumperNumbers';
import { planTwoRateShaping, ShapingRate } from './shaping';
import { JumperInputs } from './types';

export const SLEEVE_RIBBING_CM = 5;
const EXTRA_ROWS_PER_SLOW_CAP_DECREASE = 4;

export type SleeveNumbers = {
  castOnStitches: number;
  bicepsStitches: number;
  increaseRows: number;
  increases: ShapingRate[];
  underarmBindOff: number;
  capStitches: number;
  capTopStitches: number;
  capDecreasesEveryRightSideRow: number;
  capDecreasesEveryThirdRightSideRow: number;
};

function calculateArmholeEdgeCm(
  inputs: JumperInputs,
  bodyNumbers: JumperNumbers,
) {
  const stitchesPerCm = inputs.gauge.stitches / 10;
  const rowsPerCm = inputs.gauge.rows / 10;
  const [firstBindOff, secondBindOff] = bodyNumbers.armholeBindOffs;
  const decreaseRows = 2 * bodyNumbers.armholeDecreaseRows;
  const shapingRows = 4 + decreaseRows;

  const boundOffCm = (firstBindOff + secondBindOff) / stitchesPerCm;
  const decreaseSlopeCm = Math.hypot(
    bodyNumbers.armholeDecreaseRows / stitchesPerCm,
    decreaseRows / rowsPerCm,
  );
  const straightCm = inputs.armholeDepth - shapingRows / rowsPerCm;
  return boundOffCm + decreaseSlopeCm + straightCm;
}

function planCapDecreases(rows: number, decreasesPerSide: number) {
  const everyRightSideRows = 2 * decreasesPerSide;
  const spareRows = Math.max(
    0,
    Math.floor((rows - everyRightSideRows) / 2) * 2,
  );
  const everyThirdRightSideRow = Math.min(
    decreasesPerSide,
    Math.floor(spareRows / EXTRA_ROWS_PER_SLOW_CAP_DECREASE),
  );
  return {
    capDecreasesEveryRightSideRow: decreasesPerSide - everyThirdRightSideRow,
    capDecreasesEveryThirdRightSideRow: everyThirdRightSideRow,
  };
}

export function calculateSleeveNumbers(
  inputs: JumperInputs,
  bodyNumbers: JumperNumbers,
): SleeveNumbers {
  const stitchesPerCm = inputs.sleeveGauge.stitches / 10;
  const rowsPerCm = inputs.sleeveGauge.rows / 10;
  const convertCmToStitches = (cm: number) => cm * stitchesPerCm;

  const castOnStitches = roundToNearestMultiple(
    convertCmToStitches(addEase(inputs.wrist)),
    2,
  );
  const bicepsStitches = roundToNearestMultiple(
    convertCmToStitches(addEase(inputs.biceps)),
    2,
  );
  const increaseRows = Math.round(
    (inputs.wristToUnderarm - SLEEVE_RIBBING_CM) * rowsPerCm,
  );
  const increasePairs = (bicepsStitches - castOnStitches) / 2;

  const [firstBindOff, secondBindOff] = bodyNumbers.armholeBindOffs;
  const bodyBindOffCm =
    (firstBindOff + secondBindOff) / (inputs.gauge.stitches / 10);
  const underarmBindOff = Math.round(convertCmToStitches(bodyBindOffCm));
  const capStitches = bicepsStitches - 2 * underarmBindOff;
  const capTopStitches = roundToNearestMultiple(
    (bicepsStitches * inputs.capTopPercent) / 100,
    2,
  );
  const decreasesPerSide = (capStitches - capTopStitches) / 2;

  const armholeCm = 2 * calculateArmholeEdgeCm(inputs, bodyNumbers);
  const slopeCm =
    (armholeCm -
      (2 * underarmBindOff) / stitchesPerCm -
      capTopStitches / stitchesPerCm) /
    2;
  const slopeBaseCm = decreasesPerSide / stitchesPerCm;
  const capHeightCm = Math.sqrt(Math.max(0, slopeCm ** 2 - slopeBaseCm ** 2));

  return {
    castOnStitches,
    bicepsStitches,
    increaseRows,
    increases:
      increasePairs > 0 ? planTwoRateShaping(increaseRows, increasePairs) : [],
    underarmBindOff,
    capStitches,
    capTopStitches,
    ...planCapDecreases(Math.round(capHeightCm * rowsPerCm), decreasesPerSide),
  };
}
