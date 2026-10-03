import { turnToward } from './treeGeometry';
import { PrintSeries } from './types';

type Random = () => number;

export type TreeSpecies = {
  trunkWidths: [number, number];
  firstLevel: number;
  levelSpacing: [number, number];
  trunkSway: number;
  measureLimb: (pages: number) => number;
  limbWidths: [number, number];
  limbSegments: number;
  findStartAngle: (side: number, random: Random) => number;
  bendLimb: (angle: number, index: number, random: Random) => number;
  twigCount: [number, number];
  findTwigAngle: (angle: number, random: Random) => number;
  bendTwig: (angle: number, index: number, random: Random) => number;
};

const UP = -90;
const DOWN = 90;

const swayAlternately = (index: number, amount: number) =>
  (index % 2 ? 1 : -1) * amount;

const CALLISTEMON: TreeSpecies = {
  trunkWidths: [13, 8],
  firstLevel: 58,
  levelSpacing: [38, 52],
  trunkSway: 7,
  measureLimb: (pages) => 56 + pages * 0.17,
  limbWidths: [7, 3.5],
  limbSegments: 5,
  findStartAngle: (side, random) =>
    side < 0 ? -118 - random() * 22 : -62 + random() * 22,
  bendLimb: (angle, index, random) =>
    turnToward(angle, DOWN, 0.08 + index * 0.07) + (random() - 0.5) * 16,
  twigCount: [1, 2],
  findTwigAngle: (angle, random) =>
    turnToward(angle, DOWN, 0.35 + random() * 0.2),
  bendTwig: (angle, _, random) =>
    turnToward(angle, DOWN, 0.18) + (random() - 0.5) * 12,
};

const SAKURA: TreeSpecies = {
  trunkWidths: [22, 11],
  firstLevel: 44,
  levelSpacing: [30, 40],
  trunkSway: 10,
  measureLimb: (pages) => 74 + pages * 0.22,
  limbWidths: [9, 4],
  limbSegments: 6,
  findStartAngle: (side, random) =>
    side < 0 ? -165 + random() * 25 : -15 - random() * 25,
  bendLimb: (angle, index, random) =>
    turnToward(angle, UP, 0.04) + swayAlternately(index, 14 + random() * 14),
  twigCount: [1, 3],
  findTwigAngle: (angle, random) =>
    turnToward(angle, UP, 0.55 + random() * 0.25),
  bendTwig: (angle, index, random) =>
    angle + swayAlternately(index, 10 + random() * 14),
};

export const TREE_SPECIES: Record<PrintSeries['type'], TreeSpecies> = {
  book: CALLISTEMON,
  manga: SAKURA,
};
