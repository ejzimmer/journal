import { calculateHoodNumbers } from './hoodNumbers';
import { calculateJumperNumbers, RIBBING_CM } from './jumperNumbers';
import { ShapingRate } from './shaping';
import { calculateSleeveNumbers, SLEEVE_RIBBING_CM } from './sleeveNumbers';
import { JumperInputs, PatternPiece } from './types';

const ORDINAL_SUFFIXES: Record<Intl.LDMLPluralRule, string> = {
  zero: 'th',
  one: 'st',
  two: 'nd',
  few: 'rd',
  many: 'th',
  other: 'th',
};
const ordinalRules = new Intl.PluralRules('en', { type: 'ordinal' });

function formatRowInterval(interval: number) {
  if (interval === 1) return 'every row';
  return `every ${interval}${ORDINAL_SUFFIXES[ordinalRules.select(interval)]} row`;
}

function formatTimes(count: number) {
  return count === 1 ? 'once' : `${count} times`;
}

function describeShapingRates(rates: ShapingRate[]) {
  return rates
    .map(
      ({ interval, count }) =>
        `${formatRowInterval(interval)} ${formatTimes(count)}`,
    )
    .join(', then ');
}

type Edge = 'right' | 'left';
type Shaping = 'increase' | 'decrease';

const LEANS: Record<Shaping, Record<Edge, string>> = {
  decrease: { right: 'left-leaning', left: 'right-leaning' },
  increase: { right: 'right-leaning', left: 'left-leaning' },
};

const BOTH_EDGES: Edge[] = ['right', 'left'];

function describeEdgeShaping(shaping: Shaping, edges: Edge[]) {
  return edges
    .map(
      (edge) =>
        `a ${LEANS[shaping][edge]} ${shaping} 1 st in from the ${edge} edge`,
    )
    .join(' and ');
}

type PieceShape = {
  sideEdges: Edge[];
  divide: (stitches: number) => number;
};

const BACK: PieceShape = { sideEdges: BOTH_EDGES, divide: (sts) => sts };

function writeBodySteps(
  inputs: JumperInputs,
  { sideEdges, divide }: PieceShape,
) {
  const numbers = calculateJumperNumbers(inputs);
  const { gauge } = inputs;
  const yarn = gauge.yarn ? ` and the ${gauge.yarn} yarn` : '';

  const steps = [
    `With smaller needles${yarn}, cast on ${divide(numbers.castOnStitches)} sts.`,
    `Work ${RIBBING_CM}cm of ribbing.`,
    `Change to ${gauge.needleMm}mm needles and knit straight for ${numbers.straightCm}cm.`,
  ];

  if (numbers.waistShaping) {
    steps.push(
      `Work ${describeEdgeShaping('decrease', sideEdges)} ${describeShapingRates([numbers.waistShaping.rate])} (${divide(numbers.waistStitches)} sts).`,
    );
  }

  steps.push(
    numbers.bustShaping.length > 0
      ? `Work ${describeEdgeShaping('increase', sideEdges)} ${describeShapingRates(numbers.bustShaping)} (${divide(numbers.bustStitches)} sts).`
      : `Knit straight for ${numbers.bustRows} rows.`,
  );

  return { numbers, steps };
}

function writeBackSteps(inputs: JumperInputs) {
  const { numbers, steps } = writeBodySteps(inputs, BACK);
  const [firstBindOff, secondBindOff] = numbers.armholeBindOffs;
  const afterFirstBindOff = numbers.bustStitches - 2 * firstBindOff;
  const afterSecondBindOff = afterFirstBindOff - 2 * secondBindOff;

  steps.push(
    `Bind off ${firstBindOff} sts at the start of the next 2 rows (${afterFirstBindOff} sts).`,
    `Bind off ${secondBindOff} sts at the start of the next 2 rows (${afterSecondBindOff} sts).`,
  );
  if (numbers.armholeDecreaseRows > 0) {
    steps.push(
      `Work ${describeEdgeShaping('decrease', BOTH_EDGES)} every right side row ${formatTimes(numbers.armholeDecreaseRows)} (${afterSecondBindOff - 2 * numbers.armholeDecreaseRows} sts).`,
    );
  }
  steps.push(
    `Knit until the back measures ${numbers.lengthToShouldersCm}cm.`,
    `On each side, short row across the ${numbers.shoulderShortRowStitches} sts on the neck side, then bind off all ${numbers.shoulderStitches} shoulder sts.`,
    `Leave the ${numbers.neckStitches} back neck sts live for the hood.`,
  );
  return steps;
}

type FrontSide = { sideEdge: Edge; neckEdge: Edge };

const RIGHT_FRONT: FrontSide = { sideEdge: 'left', neckEdge: 'right' };
const LEFT_FRONT: FrontSide = { sideEdge: 'right', neckEdge: 'left' };

function findRowsStartingAt(edge: Edge) {
  return edge === 'right' ? 'right side' : 'wrong side';
}

function writeFrontSteps(
  inputs: JumperInputs,
  { sideEdge, neckEdge }: FrontSide,
) {
  const { numbers, steps } = writeBodySteps(inputs, {
    sideEdges: [sideEdge],
    divide: (sts) => sts / 2,
  });
  const [firstBindOff, secondBindOff] = numbers.armholeBindOffs;
  const afterBindOffs = numbers.bustStitches / 2 - firstBindOff - secondBindOff;
  const afterArmhole = afterBindOffs - numbers.armholeDecreaseRows;
  const afterNeckBindOff = afterArmhole - numbers.frontNeckBindOff;

  steps.push(
    `Bind off ${firstBindOff} sts, then ${secondBindOff} sts at the start of the next 2 ${findRowsStartingAt(sideEdge)} rows (${afterBindOffs} sts).`,
  );
  if (numbers.armholeDecreaseRows > 0) {
    steps.push(
      `Work ${describeEdgeShaping('decrease', [sideEdge])} every right side row ${formatTimes(numbers.armholeDecreaseRows)} (${afterArmhole} sts).`,
    );
  }
  steps.push(
    `Knit until the front measures ${numbers.frontNeckStartCm}cm.`,
    `Bind off ${numbers.frontNeckBindOff} sts at the start of the next ${findRowsStartingAt(neckEdge)} row (${afterNeckBindOff} sts).`,
    `Work ${describeEdgeShaping('decrease', [neckEdge])} ${describeShapingRates(
      [
        { interval: 1, count: numbers.frontNeckDecreasesEveryRow },
        { interval: 2, count: numbers.frontNeckDecreasesEverySecondRow },
      ].filter(({ count }) => count > 0),
    )} (${numbers.shoulderStitches} sts).`,
    `Knit straight until the front measures ${numbers.lengthToShouldersCm}cm.`,
    `Short row across the ${numbers.shoulderShortRowStitches} sts on the neck side, then bind off all ${numbers.shoulderStitches} shoulder sts.`,
  );
  return steps;
}

function writeSleeveSteps(inputs: JumperInputs) {
  const numbers = calculateSleeveNumbers(
    inputs,
    calculateJumperNumbers(inputs),
  );
  const { sleeveGauge } = inputs;
  const yarn = sleeveGauge.yarn ? ` and the ${sleeveGauge.yarn} yarn` : '';
  const afterRightSideDecreases =
    numbers.capStitches - 2 * numbers.capDecreasesEveryRightSideRow;

  const steps = [
    `With smaller needles${yarn}, cast on ${numbers.castOnStitches} sts.`,
    `Work ${SLEEVE_RIBBING_CM}cm of ribbing.`,
    numbers.increases.length > 0
      ? `Change to ${sleeveGauge.needleMm}mm needles. Work ${describeEdgeShaping('increase', BOTH_EDGES)} ${describeShapingRates(numbers.increases)} (${numbers.bicepsStitches} sts).`
      : `Change to ${sleeveGauge.needleMm}mm needles and knit straight for ${numbers.increaseRows} rows.`,
    `Bind off ${numbers.underarmBindOff} sts at the start of the next 2 rows (${numbers.capStitches} sts).`,
  ];
  if (numbers.capDecreasesEveryRightSideRow > 0) {
    steps.push(
      `Work ${describeEdgeShaping('decrease', BOTH_EDGES)} every right side row ${formatTimes(numbers.capDecreasesEveryRightSideRow)} (${afterRightSideDecreases} sts).`,
    );
  }
  if (numbers.capDecreasesEveryThirdRightSideRow > 0) {
    steps.push(
      `Work ${describeEdgeShaping('decrease', BOTH_EDGES)} every 3rd right side row ${formatTimes(numbers.capDecreasesEveryThirdRightSideRow)} (${numbers.capTopStitches} sts).`,
    );
  }
  steps.push(`Bind off the remaining ${numbers.capTopStitches} sts.`);
  return steps;
}

function writeHoodSteps(inputs: JumperInputs) {
  const numbers = calculateHoodNumbers(inputs, calculateJumperNumbers(inputs));
  const { pickUpStitchesPerSide, centreStitches, sideStitchesAtBackOfHead } =
    numbers;
  const pickedUpStitches = 2 * pickUpStitchesPerSide + centreStitches;

  const steps = [
    `With the right side facing, pick up and knit ${pickUpStitchesPerSide} sts along the right front neck edge, knit across the ${centreStitches} live back neck sts, then pick up and knit ${pickUpStitchesPerSide} sts along the left front neck edge (${pickedUpStitches} sts). Place a marker either side of the back sts.`,
    numbers.increases.length > 0
      ? `Increase 1 st outside each marker ${describeShapingRates(numbers.increases)} (${2 * sideStitchesAtBackOfHead + centreStitches} sts).`
      : `Knit ${numbers.increaseRows} rows.`,
  ];
  if (numbers.shortRowPairs > 0) {
    steps.push(
      `Over the ${centreStitches} centre sts, work ${numbers.shortRowPairs} pairs of short rows around the back of the head.`,
    );
  }
  if (numbers.decreases.length > 0) {
    steps.push(
      `Decrease 1 st outside each marker ${describeShapingRates(numbers.decreases)} (${centreStitches} sts).`,
    );
  }
  return steps;
}

export function writeJumperPattern(inputs: JumperInputs): PatternPiece[] {
  return [
    { name: 'Back', steps: writeBackSteps(inputs) },
    { name: 'Right front', steps: writeFrontSteps(inputs, RIGHT_FRONT) },
    { name: 'Left front', steps: writeFrontSteps(inputs, LEFT_FRONT) },
    { name: 'Sleeves (make 2)', steps: writeSleeveSteps(inputs) },
    { name: 'Hood', steps: writeHoodSteps(inputs) },
  ];
}
