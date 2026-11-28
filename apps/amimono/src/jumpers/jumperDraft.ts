import {
  EasedMeasurementKey,
  FixedMeasurementKey,
  JumperInputs,
  MeasurementSource,
} from './types';

export type EasedMeasurementDraft = {
  cm: string;
  source: MeasurementSource;
  easeCm: string;
};

export type GaugeDraft = {
  stitches: string;
  rows: string;
  needleMm: string;
  yarn: string;
};

export type JumperDraft = Record<FixedMeasurementKey, string> &
  Record<EasedMeasurementKey, EasedMeasurementDraft> & {
    gauge: GaugeDraft;
    sleeveGauge: GaugeDraft;
    capTopPercent: string;
  };

export const FIXED_MEASUREMENTS: Record<FixedMeasurementKey, string> = {
  neckWidth: 'Neck width',
  crossChest: 'Cross chest',
  armholeDepth: 'Armhole depth',
  hemToArmhole: 'Hem to armhole',
  waistToHip: 'Waist to hip',
  wristToUnderarm: 'Wrist to underarm',
  neckToBackOfHead: 'Neck to back of head',
  hoodWidth: 'Hood width',
};

export const EASED_MEASUREMENTS: Record<
  EasedMeasurementKey,
  { label: string; easeGuide?: string }
> = {
  bust: { label: 'Bust', easeGuide: '−5cm+, 0–5cm average' },
  waist: { label: 'Waist', easeGuide: '7.5cm+, 10–15cm average' },
  hips: { label: 'Hips', easeGuide: '5cm+' },
  biceps: { label: 'Biceps', easeGuide: '2.5cm+' },
  wrist: { label: 'Wrist', easeGuide: '5–10cm' },
  hoodHeight: { label: 'Hood height' },
  hoodDepth: { label: 'Hood depth' },
};

export const CAP_TOP_GUIDE = '25–40%';

const EMPTY_EASED_MEASUREMENT: EasedMeasurementDraft = {
  cm: '',
  source: 'body',
  easeCm: '',
};

const EMPTY_GAUGE: GaugeDraft = {
  stitches: '',
  rows: '',
  needleMm: '',
  yarn: '',
};

export const EMPTY_JUMPER_DRAFT: JumperDraft = {
  neckWidth: '',
  crossChest: '',
  armholeDepth: '',
  hemToArmhole: '',
  waistToHip: '',
  wristToUnderarm: '',
  neckToBackOfHead: '',
  hoodWidth: '',
  bust: EMPTY_EASED_MEASUREMENT,
  waist: EMPTY_EASED_MEASUREMENT,
  hips: EMPTY_EASED_MEASUREMENT,
  biceps: EMPTY_EASED_MEASUREMENT,
  wrist: EMPTY_EASED_MEASUREMENT,
  hoodHeight: EMPTY_EASED_MEASUREMENT,
  hoodDepth: EMPTY_EASED_MEASUREMENT,
  gauge: EMPTY_GAUGE,
  sleeveGauge: EMPTY_GAUGE,
  capTopPercent: '',
};

function parsePositiveNumber(value: string) {
  const parsed = Number(value);
  return value.trim() !== '' && parsed > 0 ? parsed : undefined;
}

function parseEase(value: string) {
  const parsed = Number(value);
  return value.trim() !== '' && Number.isFinite(parsed) ? parsed : undefined;
}

function convertEasedMeasurement({
  cm,
  source,
  easeCm,
}: EasedMeasurementDraft) {
  const parsedCm = parsePositiveNumber(cm);
  if (parsedCm === undefined) return undefined;
  if (source === 'garment') return { cm: parsedCm, source };
  const parsedEase = parseEase(easeCm);
  if (parsedEase === undefined) return undefined;
  return { cm: parsedCm, source, easeCm: parsedEase };
}

function convertGauge({ stitches, rows, needleMm, yarn }: GaugeDraft) {
  const parsed = {
    stitches: parsePositiveNumber(stitches),
    rows: parsePositiveNumber(rows),
    needleMm: parsePositiveNumber(needleMm),
  };
  if (Object.values(parsed).some((value) => value === undefined)) {
    return undefined;
  }
  const trimmedYarn = yarn.trim();
  return { ...parsed, ...(trimmedYarn && { yarn: trimmedYarn }) };
}

export function convertDraftToInputs(
  draft: JumperDraft,
): JumperInputs | undefined {
  const fixed = Object.fromEntries(
    Object.keys(FIXED_MEASUREMENTS).map((key) => [
      key,
      parsePositiveNumber(draft[key as FixedMeasurementKey]),
    ]),
  );
  const eased = Object.fromEntries(
    Object.keys(EASED_MEASUREMENTS).map((key) => [
      key,
      convertEasedMeasurement(draft[key as EasedMeasurementKey]),
    ]),
  );
  const gauge = convertGauge(draft.gauge);
  const sleeveGauge = convertGauge(draft.sleeveGauge);
  const capTopPercent = parsePositiveNumber(draft.capTopPercent);
  const values = [
    ...Object.values(fixed),
    ...Object.values(eased),
    gauge,
    sleeveGauge,
    capTopPercent,
  ];
  if (values.some((value) => value === undefined)) return undefined;

  return {
    ...fixed,
    ...eased,
    gauge,
    sleeveGauge,
    capTopPercent,
  } as JumperInputs;
}
