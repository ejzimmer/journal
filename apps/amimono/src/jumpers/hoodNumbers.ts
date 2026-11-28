import { addEase, FRONT_NECK_DEPTH_CM, JumperNumbers } from './jumperNumbers';
import { planTwoRateShaping, ShapingRate } from './shaping';
import { JumperInputs } from './types';

export type HoodNumbers = {
  pickUpStitchesPerSide: number;
  centreStitches: number;
  sideStitchesAtBackOfHead: number;
  increases: ShapingRate[];
  increaseRows: number;
  shortRowPairs: number;
  decreases: ShapingRate[];
  decreaseRows: number;
};

function calculateFrontNeckEdgeCm(
  inputs: JumperInputs,
  bodyNumbers: JumperNumbers,
) {
  const stitchesPerCm = inputs.gauge.stitches / 10;
  const rowsPerCm = inputs.gauge.rows / 10;
  const {
    frontNeckBindOff,
    frontNeckDecreasesEveryRow,
    frontNeckDecreasesEverySecondRow,
  } = bodyNumbers;
  const decreases =
    frontNeckDecreasesEveryRow + frontNeckDecreasesEverySecondRow;
  const decreaseRows =
    frontNeckDecreasesEveryRow + 2 * frontNeckDecreasesEverySecondRow;

  const boundOffCm = frontNeckBindOff / stitchesPerCm;
  const decreaseSlopeCm = Math.hypot(
    decreases / stitchesPerCm,
    decreaseRows / rowsPerCm,
  );
  const straightCm = FRONT_NECK_DEPTH_CM - decreaseRows / rowsPerCm;
  return boundOffCm + decreaseSlopeCm + straightCm;
}

function planShaping(rows: number, shapingRows: number) {
  return shapingRows > 0 ? planTwoRateShaping(rows, shapingRows) : [];
}

export function calculateHoodNumbers(
  inputs: JumperInputs,
  bodyNumbers: JumperNumbers,
): HoodNumbers {
  const stitchesPerCm = inputs.gauge.stitches / 10;
  const rowsPerCm = inputs.gauge.rows / 10;
  const convertCmToRows = (cm: number) => Math.round(cm * rowsPerCm);

  const centreStitches = bodyNumbers.neckStitches;
  const halfCentreCm = centreStitches / stitchesPerCm / 2;
  const pickUpStitchesPerSide = Math.round(
    calculateFrontNeckEdgeCm(inputs, bodyNumbers) * stitchesPerCm,
  );
  const sideStitchesAtBackOfHead = Math.max(
    pickUpStitchesPerSide,
    Math.round((inputs.hoodWidth - halfCentreCm) * stitchesPerCm),
  );

  const sideRows = convertCmToRows(addEase(inputs.hoodHeight) - halfCentreCm);
  const centreRows = convertCmToRows(addEase(inputs.hoodDepth));
  const increaseRows = Math.min(
    sideRows,
    convertCmToRows(inputs.neckToBackOfHead),
  );
  const decreaseRows = sideRows - increaseRows;

  return {
    pickUpStitchesPerSide,
    centreStitches,
    sideStitchesAtBackOfHead,
    increases: planShaping(
      increaseRows,
      sideStitchesAtBackOfHead - pickUpStitchesPerSide,
    ),
    increaseRows,
    shortRowPairs: Math.max(0, Math.floor((centreRows - sideRows) / 2)),
    decreases: planShaping(decreaseRows, sideStitchesAtBackOfHead),
    decreaseRows,
  };
}
