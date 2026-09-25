import { YarnTypeId } from './types';

export const GRAMS_PER_BALL = 200;

export const YARN_COLOURS: Record<YarnTypeId, string> = {
  wool: 'hsl(256 80% 60%)',
  cotton: 'hsl(194 97% 48%)',
  acrylic: 'hsl(150 90% 49%)',
  'sock yarn': 'hsl(305 94% 47%)',
};
