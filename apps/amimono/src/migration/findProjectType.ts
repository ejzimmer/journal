import { ProjectType } from '../projects/types';

const TYPES_BY_KEYWORD: Array<[RegExp, ProjectType]> = [
  [/sleeve|band|mitten|glove|cowl|scarf/, 'accessory'],
  [/sock/, 'socks'],
  [/cardigan|cardi|jacket|bolero/, 'cardigan'],
  [/vest|tank|unabridged/, 'vest'],
  [/jumper|sweater|pullover/, 'jumper'],
  [/hat|beanie|tam|beret/, 'hat'],
  [/blanket|afghan/, 'blanket'],
  [/shawl|wrap/, 'shawl'],
  [/amigurumi|unicorn/, 'amigurumi'],
];

export function findProjectType(name: string, hasSocks: boolean): ProjectType {
  if (hasSocks) return 'socks';
  const lowerCaseName = name.toLowerCase();
  return (
    TYPES_BY_KEYWORD.find(([keyword]) => keyword.test(lowerCaseName))?.[1] ??
    'accessory'
  );
}
