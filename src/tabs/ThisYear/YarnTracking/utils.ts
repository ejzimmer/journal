import { YarnTypeId } from './types';

export const GRAMS_PER_BALL = 200;

export const YARN_COLOURS: Record<YarnTypeId, string> = {
  wool: 'hsl(268 62% 74%)',
  cotton: 'hsl(198 72% 74%)',
  acrylic: 'hsl(150 48% 70%)',
  'sock yarn': 'hsl(335 78% 80%)',
};
