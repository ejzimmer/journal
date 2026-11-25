import { calculateJumperNumbers, RIBBING_CM } from './jumperNumbers';
import { ShapingRate } from './shaping';
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

function formatStitches(count: number) {
  return count === 1 ? '1 st' : `${count} sts`;
}

function describeShapingRates(rates: ShapingRate[]) {
  return rates
    .map(
      ({ interval, count }) =>
        `${formatRowInterval(interval)} ${formatTimes(count)}`,
    )
    .join(', then ');
}

type PieceShape = {
  stitchesPerShaping: number;
  divide: (stitches: number) => number;
};

const BACK: PieceShape = { stitchesPerShaping: 2, divide: (sts) => sts };
const FRONT: PieceShape = { stitchesPerShaping: 1, divide: (sts) => sts / 2 };

function writeBodySteps(
  inputs: JumperInputs,
  { stitchesPerShaping, divide }: PieceShape,
) {
  const numbers = calculateJumperNumbers(inputs);
  const { gauge } = inputs;
  const shaped = formatStitches(stitchesPerShaping);
  const yarn = gauge.yarn ? ` and the ${gauge.yarn} yarn` : '';

  const steps = [
    `With smaller needles${yarn}, cast on ${divide(numbers.castOnStitches)} sts.`,
    `Work ${RIBBING_CM}cm of ribbing.`,
    `Change to ${gauge.needleMm}mm needles and knit straight for ${numbers.straightCm}cm.`,
  ];

  if (numbers.waistShaping) {
    steps.push(
      `Decrease ${shaped} ${describeShapingRates([numbers.waistShaping.rate])} (${divide(numbers.waistStitches)} sts).`,
    );
  }

  steps.push(
    numbers.bustShaping.length > 0
      ? `Increase ${shaped} ${describeShapingRates(numbers.bustShaping)} (${divide(numbers.bustStitches)} sts).`
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
      `Decrease 2 sts every right side row ${formatTimes(numbers.armholeDecreaseRows)} (${afterSecondBindOff - 2 * numbers.armholeDecreaseRows} sts).`,
    );
  }
  steps.push(
    `Knit until the back measures ${numbers.lengthToShouldersCm}cm.`,
    `On each side, short row across the ${numbers.shoulderShortRowStitches} sts on the neck side, then bind off all ${numbers.shoulderStitches} shoulder sts.`,
  );
  return steps;
}

function writeFrontSteps(inputs: JumperInputs) {
  const { numbers, steps } = writeBodySteps(inputs, FRONT);
  const [firstBindOff, secondBindOff] = numbers.armholeBindOffs;
  const afterBindOffs = numbers.bustStitches / 2 - firstBindOff - secondBindOff;
  const afterArmhole = afterBindOffs - numbers.armholeDecreaseRows;
  const afterNeckBindOff = afterArmhole - numbers.frontNeckBindOff;

  steps.push(
    `At the armhole edge, bind off ${firstBindOff} sts, then ${secondBindOff} sts (${afterBindOffs} sts).`,
  );
  if (numbers.armholeDecreaseRows > 0) {
    steps.push(
      `Decrease 1 st at the armhole edge every right side row ${formatTimes(numbers.armholeDecreaseRows)} (${afterArmhole} sts).`,
    );
  }
  steps.push(
    `Knit until the front measures ${numbers.frontNeckStartCm}cm.`,
    `At the neck edge, bind off ${numbers.frontNeckBindOff} sts (${afterNeckBindOff} sts).`,
    `Decrease 1 st at the neck edge ${describeShapingRates(
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

export function writeJumperPattern(inputs: JumperInputs): PatternPiece[] {
  return [
    { name: 'Back', steps: writeBackSteps(inputs) },
    { name: 'Fronts (make 2)', steps: writeFrontSteps(inputs) },
  ];
}
