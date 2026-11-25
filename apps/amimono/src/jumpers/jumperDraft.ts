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
  };

export const FIXED_MEASUREMENTS: Record<FixedMeasurementKey, string> = {
  neckWidth: 'Neck width',
  crossChest: 'Cross chest',
  armholeDepth: 'Armhole depth',
  hemToArmhole: 'Hem to armhole',
  waistToHip: 'Waist to hip',
};

export const EASED_MEASUREMENTS: Record<
  EasedMeasurementKey,
  { label: string; easeGuide: string }
> = {
  bust: { label: 'Bust', easeGuide: '−5cm+, 0–5cm average' },
  waist: { label: 'Waist', easeGuide: '7.5cm+, 10–15cm average' },
  hips: { label: 'Hips', easeGuide: '5cm+' },
};

const EMPTY_EASED_MEASUREMENT: EasedMeasurementDraft = {
  cm: '',
  source: 'body',
  easeCm: '',
};

export const EMPTY_JUMPER_DRAFT: JumperDraft = {
  neckWidth: '',
  crossChest: '',
  armholeDepth: '',
  hemToArmhole: '',
  waistToHip: '',
  bust: EMPTY_EASED_MEASUREMENT,
  waist: EMPTY_EASED_MEASUREMENT,
  hips: EMPTY_EASED_MEASUREMENT,
  gauge: { stitches: '', rows: '', needleMm: '', yarn: '' },
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
  const gauge = {
    stitches: parsePositiveNumber(draft.gauge.stitches),
    rows: parsePositiveNumber(draft.gauge.rows),
    needleMm: parsePositiveNumber(draft.gauge.needleMm),
  };
  const values = [
    ...Object.values(fixed),
    ...Object.values(eased),
    ...Object.values(gauge),
  ];
  if (values.some((value) => value === undefined)) return undefined;

  const yarn = draft.gauge.yarn.trim();
  return {
    ...fixed,
    ...eased,
    gauge: { ...gauge, ...(yarn && { yarn }) },
  } as JumperInputs;
}
