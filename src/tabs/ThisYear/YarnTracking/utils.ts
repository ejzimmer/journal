import { YarnTypeId } from './types';

export const GRAMS_PER_BALL = 200;

export const YARN_COLOURS: Record<YarnTypeId, string> = {
  wool: 'hsl(340 60% 84%)',
  cotton: 'hsl(170 50% 72%)',
  acrylic: 'hsl(205 90% 76%)',
  'sock yarn': 'hsl(275 50% 76%)',
};
