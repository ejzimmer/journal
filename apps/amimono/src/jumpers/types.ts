export const JUMPER_PATTERNS_KEY = 'jumpers';

export type MeasurementSource = 'body' | 'garment';

export type EasedMeasurementKey =
  'bust' | 'waist' | 'hips' | 'biceps' | 'wrist';

export type FixedMeasurementKey =
  | 'neckWidth'
  | 'crossChest'
  | 'armholeDepth'
  | 'hemToArmhole'
  | 'waistToHip'
  | 'wristToUnderarm';

export type EasedMeasurement = {
  cm: number;
  source: MeasurementSource;
  easeCm?: number;
};

export type JumperGauge = {
  stitches: number;
  rows: number;
  needleMm: number;
  yarn?: string;
};

export type JumperInputs = Record<FixedMeasurementKey, number> &
  Record<EasedMeasurementKey, EasedMeasurement> & {
    gauge: JumperGauge;
    sleeveGauge: JumperGauge;
    capTopPercent: number;
  };

export type PatternPiece = {
  name: string;
  steps: string[];
};

export type JumperPattern = {
  id: string;
  name: string;
  inputs: JumperInputs;
  pieces: PatternPiece[];
};
