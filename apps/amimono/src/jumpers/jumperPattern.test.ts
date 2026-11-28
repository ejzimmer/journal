import { writeJumperPattern } from './jumperPattern';
import { JumperInputs } from './types';

const EXAMPLE_INPUTS: JumperInputs = {
  neckWidth: 21,
  crossChest: 43,
  armholeDepth: 23,
  hemToArmhole: 41,
  waistToHip: 28,
  bust: { cm: 101.5, source: 'body', easeCm: 5 },
  waist: { cm: 86, source: 'body', easeCm: 12.5 },
  hips: { cm: 105, source: 'body', easeCm: 10 },
  biceps: { cm: 29, source: 'body', easeCm: 5 },
  wrist: { cm: 16, source: 'body', easeCm: 7.5 },
  wristToUnderarm: 50,
  neckToBackOfHead: 7,
  hoodWidth: 33,
  hoodHeight: { cm: 32, source: 'body', easeCm: 5 },
  hoodDepth: { cm: 47, source: 'body', easeCm: 10 },
  gauge: { stitches: 22, rows: 29, needleMm: 4.5, yarn: 'grey' },
  sleeveGauge: { stitches: 24, rows: 31, needleMm: 4 },
  capTopPercent: 30,
};

function findSteps(inputs: JumperInputs, pieceName: string) {
  const piece = writeJumperPattern(inputs).find(
    ({ name }) => name === pieceName,
  );
  if (!piece) throw new Error(`No ${pieceName} piece`);
  return piece.steps;
}

describe('writeJumperPattern', () => {
  describe('for the example cardigan', () => {
    it('writes the back', () => {
      expect(findSteps(EXAMPLE_INPUTS, 'Back')).toEqual([
        'With smaller needles and the grey yarn, cast on 128 sts.',
        'Work 5cm of ribbing.',
        'Change to 4.5mm needles and knit straight for 7cm.',
        'Work a left-leaning decrease 1 st in from the right edge and a right-leaning decrease 1 st in from the left edge every 5th row 9 times (110 sts).',
        'Work a right-leaning increase 1 st in from the right edge and a left-leaning increase 1 st in from the left edge every 10th row 2 times, then every 9th row 2 times (118 sts).',
        'Bind off 6 sts at the start of the next 2 rows (106 sts).',
        'Bind off 3 sts at the start of the next 2 rows (100 sts).',
        'Work a left-leaning decrease 1 st in from the right edge and a right-leaning decrease 1 st in from the left edge every right side row 3 times (94 sts).',
        'Knit until the back measures 64cm.',
        'On each side, short row across the 12 sts on the neck side, then bind off all 24 shoulder sts.',
        'Leave the 46 back neck sts live for the hood.',
      ]);
    });

    describe('writes the fronts', () => {
      const stepsBeforeShaping = [
        'With smaller needles and the grey yarn, cast on 64 sts.',
        'Work 5cm of ribbing.',
        'Change to 4.5mm needles and knit straight for 7cm.',
      ];

      it('shapes the right front with its side on the left edge and its neck on the right edge', () => {
        expect(findSteps(EXAMPLE_INPUTS, 'Right front')).toEqual([
          ...stepsBeforeShaping,
          'Work a right-leaning decrease 1 st in from the left edge every 5th row 9 times (55 sts).',
          'Work a left-leaning increase 1 st in from the left edge every 10th row 2 times, then every 9th row 2 times (59 sts).',
          'Bind off 6 sts, then 3 sts at the start of the next 2 wrong side rows (50 sts).',
          'Work a right-leaning decrease 1 st in from the left edge every right side row 3 times (47 sts).',
          'Knit until the front measures 56cm.',
          'Bind off 12 sts at the start of the next right side row (35 sts).',
          'Work a left-leaning decrease 1 st in from the right edge every row 7 times, then every 2nd row 4 times (24 sts).',
          'Knit straight until the front measures 64cm.',
          'Short row across the 12 sts on the neck side, then bind off all 24 shoulder sts.',
        ]);
      });

      it('shapes the left front with its side on the right edge and its neck on the left edge', () => {
        expect(findSteps(EXAMPLE_INPUTS, 'Left front')).toEqual([
          ...stepsBeforeShaping,
          'Work a left-leaning decrease 1 st in from the right edge every 5th row 9 times (55 sts).',
          'Work a right-leaning increase 1 st in from the right edge every 10th row 2 times, then every 9th row 2 times (59 sts).',
          'Bind off 6 sts, then 3 sts at the start of the next 2 right side rows (50 sts).',
          'Work a left-leaning decrease 1 st in from the right edge every right side row 3 times (47 sts).',
          'Knit until the front measures 56cm.',
          'Bind off 12 sts at the start of the next wrong side row (35 sts).',
          'Work a right-leaning decrease 1 st in from the left edge every row 7 times, then every 2nd row 4 times (24 sts).',
          'Knit straight until the front measures 64cm.',
          'Short row across the 12 sts on the neck side, then bind off all 24 shoulder sts.',
        ]);
      });
    });

    it('writes the sleeves in the sleeve gauge', () => {
      expect(findSteps(EXAMPLE_INPUTS, 'Sleeves (make 2)')).toEqual([
        'With smaller needles, cast on 56 sts.',
        'Work 5cm of ribbing.',
        'Change to 4mm needles. Work a right-leaning increase 1 st in from the right edge and a left-leaning increase 1 st in from the left edge every 11th row 10 times, then every 10th row 3 times (82 sts).',
        'Bind off 10 sts at the start of the next 2 rows (62 sts).',
        'Work a left-leaning decrease 1 st in from the right edge and a right-leaning decrease 1 st in from the left edge every right side row 17 times (28 sts).',
        'Work a left-leaning decrease 1 st in from the right edge and a right-leaning decrease 1 st in from the left edge every 3rd right side row 2 times (24 sts).',
        'Bind off the remaining 24 sts.',
      ]);
    });

    it('writes the hood', () => {
      expect(findSteps(EXAMPLE_INPUTS, 'Hood')).toEqual([
        'With the right side facing, pick up and knit 36 sts along the right front neck edge, knit across the 46 live back neck sts, then pick up and knit 36 sts along the left front neck edge (118 sts). Place a marker either side of the back sts.',
        'Increase 1 st outside each marker every 2nd row 6 times, then every row 8 times (146 sts).',
        'Over the 46 centre sts, work 44 pairs of short rows around the back of the head.',
        'Decrease 1 st outside each marker every 2nd row 7 times, then every row 43 times (46 sts).',
      ]);
    });
  });

  describe('when a measurement comes from a garment', () => {
    it('adds no ease to it', () => {
      const inputs: JumperInputs = {
        ...EXAMPLE_INPUTS,
        hips: { cm: 115, source: 'garment', easeCm: 10 },
      };

      expect(findSteps(inputs, 'Back')[0]).toBe(
        'With smaller needles and the grey yarn, cast on 128 sts.',
      );
    });
  });

  describe('when there is no yarn name', () => {
    it('casts on without naming one', () => {
      const inputs: JumperInputs = {
        ...EXAMPLE_INPUTS,
        gauge: { stitches: 22, rows: 29, needleMm: 4.5 },
      };

      expect(findSteps(inputs, 'Back')[0]).toBe(
        'With smaller needles, cast on 128 sts.',
      );
    });
  });

  describe('when the waist is as wide as the bust', () => {
    it('knits straight up to the armholes', () => {
      const inputs: JumperInputs = {
        ...EXAMPLE_INPUTS,
        waist: { cm: 107.2, source: 'garment' },
      };

      expect(findSteps(inputs, 'Back')[4]).toBe('Knit straight for 38 rows.');
    });
  });
});
