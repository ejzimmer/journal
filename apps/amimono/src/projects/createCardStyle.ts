import { CSSProperties } from 'react';
import { PROJECT_TYPES } from './projectTypes';
import { ProjectType } from './types';

export function createCardStyle(type: ProjectType) {
  return {
    '--card-pastel': PROJECT_TYPES[type].pastel,
    '--card-dark': PROJECT_TYPES[type].dark,
  } as CSSProperties;
}
