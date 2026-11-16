import { Sock } from './types';
import { SockSectionName } from './sockProgress';

export const SOCK_OUTLINE =
  'M78 98 H162 Q165 98 165 101 L168 250 C172 285 200 300 240 330 Q290 365 262 405 Q240 432 205 418 L110 345 Q62 320 64 270 L75 101 Q75 98 78 98 Z';

export const SOCK_SECTION_SHAPES: Record<SockSectionName, string> = {
  cuff: 'M0 0 H400 V133 H0 Z',
  leg: 'M0 133 H400 V250 H168 L118 272 L64 250 H0 Z',
  heel: 'M0 250 H64 L118 272 L106 352 L100 500 H0 Z',
  gusset: 'M118 272 L171.5 446 L100 500 L106 352 Z',
  instep: 'M118 272 L168 250 H322.8 L171.5 446 Z',
  toe: 'M322.8 250 H500 V500 H130.5 Z',
};

export const SOCK_SECTION_LINES = [
  'M60 133 H180',
  'M64 250 L118 272 L168 250',
  'M118 272 L106 352',
  'M118 272 L150 376',
  'M262 329 L182 433',
].join(' ');

export const SOCK_RIBS = Array.from(
  { length: 12 },
  (_, index) => `M${80 + index * 7.5} 98 V133`,
).join(' ');

export const SOCK_PAIR_VIEWBOX = '0 0 146 156';

const SOCK_OFFSETS: Record<Sock, { x: number; y: number }> = {
  first: { x: 0, y: 0 },
  second: { x: 52, y: 16 },
};

export const getSockTransform = (sock: Sock) =>
  `translate(${SOCK_OFFSETS[sock].x} ${SOCK_OFFSETS[sock].y}) scale(-0.4 0.4) translate(-290 -90)`;

export const ANNOTATED_SOCK_PAIR_VIEWBOX = '0 0 184 180';

export function mapSockPoint(sock: Sock, [x, y]: [number, number]) {
  return {
    x: SOCK_OFFSETS[sock].x - 0.4 * (x - 290),
    y: SOCK_OFFSETS[sock].y + 0.4 * (y - 90),
  };
}

const FOOT_AXIS_START = [66, 300] as const;
const FOOT_AXIS_DIRECTION = [0.944, 0.331] as const;
const FOOT_AXIS_OUTWARD = [-0.331, 0.944] as const;

export const FOOT_TOE_START_DISTANCE = 161.6;
export const FOOT_TOE_TIP_DISTANCE = 226.7;
export const FOOT_SOLE_AT_TOE_START_OFFSET = 62;

export function mapFootPoint(sock: Sock, distance: number, offset: number) {
  return mapSockPoint(sock, [
    FOOT_AXIS_START[0] +
      distance * FOOT_AXIS_DIRECTION[0] +
      offset * FOOT_AXIS_OUTWARD[0],
    FOOT_AXIS_START[1] +
      distance * FOOT_AXIS_DIRECTION[1] +
      offset * FOOT_AXIS_OUTWARD[1],
  ]);
}

export const FOOT_TEXT_ANGLE =
  (Math.atan2(-FOOT_AXIS_DIRECTION[1], FOOT_AXIS_DIRECTION[0]) * 180) / Math.PI;
