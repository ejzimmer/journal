import { listByNumber } from './lists';
import { Volume } from './types';

export type Point = { x: number; y: number };

type Curve = [Point, Point, Point, Point];

export type TreePart = { key: string; d: string; width: number };

export type TreeLevel = { volume: Volume; stem: TreePart; branch: TreePart };

export type TreeLayout = {
  levels: TreeLevel[];
  crown: TreePart;
  bounds: { x: number; y: number; width: number; height: number };
};

export const OUTLINE_WIDTH = 3;

const FIRST_LEVEL_HEIGHT = 62;
const LEVEL_SPACING = 50;
const CROWN_HEIGHT = 34;
const TRUNK_WIDTH = 16;
const BRANCH_WIDTH = 9;
const DEFAULT_PAGES = 200;
const MARGIN = 4;

const findAttachPoint = (level: number): Point => ({
  x: 0,
  y: -FIRST_LEVEL_HEIGHT - level * LEVEL_SPACING,
});

const measureBranch = (volume: Volume) =>
  70 + (volume.pages ?? DEFAULT_PAGES) * 0.21;

const roundCoordinate = (value: number) => Math.round(value * 10) / 10;

const formatCurve = ([start, ...controls]: Curve) =>
  `M${roundCoordinate(start.x)} ${roundCoordinate(start.y)} C${controls
    .map(({ x, y }) => `${roundCoordinate(x)} ${roundCoordinate(y)}`)
    .join(' ')}`;

const createStemCurve = (from: Point, to: Point): Curve => [
  from,
  { x: from.x, y: from.y - 15 },
  { x: to.x, y: to.y + 15 },
  to,
];

const createBranchCurve = (
  attach: Point,
  side: number,
  length: number,
): Curve => [
  attach,
  { x: attach.x + side * length * 0.35, y: attach.y + 2 },
  { x: attach.x + side * length * 0.7, y: attach.y - length * 0.12 },
  { x: attach.x + side * length, y: attach.y - length * 0.36 },
];

export function createTreeLayout(volumes?: Record<string, Volume>) {
  const curves: { curve: Curve; width: number }[] = [];
  const createPart = (key: string, curve: Curve, width: number) => {
    curves.push({ curve, width });
    return { key, d: formatCurve(curve), width };
  };

  const levels = listByNumber(volumes).map((volume, index) => {
    const from = index === 0 ? { x: 0, y: 0 } : findAttachPoint(index - 1);
    const attach = findAttachPoint(index);
    const side = index % 2 ? 1 : -1;
    return {
      volume,
      stem: createPart(
        `stem-${volume.id}`,
        createStemCurve(from, attach),
        TRUNK_WIDTH,
      ),
      branch: createPart(
        `branch-${volume.id}`,
        createBranchCurve(attach, side, measureBranch(volume)),
        BRANCH_WIDTH,
      ),
    };
  });

  const crownBase = levels.length
    ? findAttachPoint(levels.length - 1)
    : { x: 0, y: 0 };
  const crown = createPart(
    'crown',
    createStemCurve(crownBase, {
      x: crownBase.x,
      y: crownBase.y - CROWN_HEIGHT,
    }),
    TRUNK_WIDTH,
  );

  const reach = Math.max(...curves.map(({ width }) => width)) / 2;
  const padding = reach + OUTLINE_WIDTH + MARGIN;
  const points = curves.flatMap(({ curve }) => curve);
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const halfWidth = Math.max(...xs.map(Math.abs)) + padding;
  const top = Math.min(...ys) - padding;
  const bottom = Math.max(...ys) + padding;

  return {
    levels,
    crown,
    bounds: {
      x: roundCoordinate(-halfWidth),
      y: roundCoordinate(top),
      width: roundCoordinate(halfWidth * 2),
      height: roundCoordinate(bottom - top),
    },
  } satisfies TreeLayout;
}

export const listTreeParts = ({ levels, crown }: TreeLayout) => [
  ...levels.flatMap(({ stem, branch }) => [stem, branch]),
  crown,
];
