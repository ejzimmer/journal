import {
  PROJECTS_KEY,
  SOCKS,
  SockDirection,
  SockProgress,
} from '../../../shared/types';

export const SOCK_CATEGORY = '🧦';

export const SOCK_SECTIONS = [
  'cuff',
  'leg',
  'heel',
  'gusset',
  'instep',
  'toe',
] as const;
export type SockSectionName = (typeof SOCK_SECTIONS)[number];

export const SECTIONS_PER_SOCK = SOCK_SECTIONS.length;
export const SECTIONS_PER_PAIR = SECTIONS_PER_SOCK * SOCKS.length;

export const NEW_SOCK_PROGRESS: SockProgress = {
  direction: 'cuff_down',
  knittedSections: { first: 0, second: 0 },
};

export const getSocksKey = (projectId: string) =>
  `${PROJECTS_KEY}/${projectId}/socks`;

export function getKnitOrder(direction: SockDirection) {
  return direction === 'toe_up' ? SOCK_SECTIONS.toReversed() : SOCK_SECTIONS;
}

export function countKnittedSections(socks: SockProgress) {
  return SOCKS.reduce((total, sock) => total + socks.knittedSections[sock], 0);
}

export function clampKnittedCount(count: number) {
  return Math.min(Math.max(count, 0), SECTIONS_PER_SOCK);
}
