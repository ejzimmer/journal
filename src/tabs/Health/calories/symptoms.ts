export const LIGHT_FLOW = '🟤';
export const HEAVY_FLOW = '🔴';
export const OVARY_PAIN = '🥚';

export type Magnitude = 1 | 2 | 3;

export type Symptom = {
  id: string;
  label: string;
  colour: string;
  path: string;
  stroked?: boolean;
};

export type LoggedSymptom = { symptom: Symptom; magnitude: Magnitude };

export const MAGNITUDES: Magnitude[] = [1, 2, 3];

export const SYMPTOMS: Symptom[] = [
  {
    id: 'headache',
    label: 'headache',
    colour: '#2f80ed',
    path: 'M11 1 4.5 11.5 9 11.5 8 19 15.5 8 10.5 8Z',
  },
  {
    id: 'flow',
    label: 'period flow',
    colour: '#d1263f',
    path: 'M10 1.7C10 1.7 4.5 9.4 4.5 12.8A5.5 5.5 0 0 0 10 18.3A5.5 5.5 0 0 0 15.5 12.8C15.5 9.4 10 1.7 10 1.7Z',
  },
  {
    id: 'cramps',
    label: 'cramps',
    colour: '#d1263f',
    path: 'M11 1 4.5 11.5 9 11.5 8 19 15.5 8 10.5 8Z',
  },
  {
    id: 'loose',
    label: 'loose stool',
    colour: '#8a5a2b',
    path: 'M10 1.7C10 1.7 4.5 9.4 4.5 12.8A5.5 5.5 0 0 0 10 18.3A5.5 5.5 0 0 0 15.5 12.8C15.5 9.4 10 1.7 10 1.7Z',
  },
  {
    id: 'gas',
    label: 'gas',
    colour: '#93a531',
    path: 'M10 5a5.5 5.5 0 1 0 0.01 0ZM8 8.2a2.2 2.2 0 0 0 -1.8 2.2',
    stroked: true,
  },
  {
    id: 'gut',
    label: 'upset gut',
    colour: '#2e9e5b',
    path: 'M11 1 4.5 11.5 9 11.5 8 19 15.5 8 10.5 8Z',
  },
  {
    id: 'tired',
    label: 'tired',
    colour: '#7b5ea7',
    path: 'M4.5 4.5H15.5L4.5 15.5H15.5',
    stroked: true,
  },
  {
    id: 'hayfever',
    label: 'hay fever',
    colour: '#e0a800',
    path: 'M6.6 5.3a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M11.5 8.9a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M9.7 14.7a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M3.5 14.7a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0M1.7 8.9a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0',
  },
  {
    id: 'throat',
    label: 'sore throat',
    colour: '#e8833a',
    path: 'M11 1 4.5 11.5 9 11.5 8 19 15.5 8 10.5 8Z',
  },
  {
    id: 'nose',
    label: 'blocked or runny nose',
    colour: '#e8833a',
    path: 'M10 1.7C10 1.7 4.5 9.4 4.5 12.8A5.5 5.5 0 0 0 10 18.3A5.5 5.5 0 0 0 15.5 12.8C15.5 9.4 10 1.7 10 1.7Z',
  },
  {
    id: 'cough',
    label: 'cough',
    colour: '#7d8a99',
    path: 'M5.5 16a3.5 3.5 0 0 1 -0.5 -7a5 5 0 0 1 9.5 -1a4 4 0 0 1 1 8Z',
  },
];

const LEGACY_TRACKERS: Record<string, string> = {
  [LIGHT_FLOW]: 'flow-1',
  [HEAVY_FLOW]: 'flow-2',
  [OVARY_PAIN]: 'cramps-2',
};

export function parseSymptoms(trackers: string[] = []): LoggedSymptom[] {
  return SYMPTOMS.flatMap((symptom) => {
    const tracker = trackers
      .map((tracker) => LEGACY_TRACKERS[tracker] ?? tracker)
      .find((tracker) => tracker.startsWith(`${symptom.id}-`));
    if (!tracker) return [];
    const magnitude = Number(tracker.split('-')[1]) as Magnitude;
    return [{ symptom, magnitude }];
  });
}

export function setSymptomMagnitude(
  trackers: string[],
  symptom: Symptom,
  magnitude: Magnitude | undefined,
) {
  const others = parseSymptoms(trackers)
    .filter((logged) => logged.symptom.id !== symptom.id)
    .map((logged) => `${logged.symptom.id}-${logged.magnitude}`);
  return magnitude ? [...others, `${symptom.id}-${magnitude}`] : others;
}
