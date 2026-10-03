import { listByNumber } from './lists';
import { createSeededRandom } from './seededRandom';
import {
  createSmoothPieces,
  Curve,
  findPointAlong,
  formatCurve,
  Point,
  roundCoordinate,
  SmoothPiece,
  walkPath,
} from './treeGeometry';
import { TREE_SPECIES, TreeSpecies } from './treeSpecies';
import { PrintSeries, Volume } from './types';

export type PieceGrowth =
  | { type: 'trunk'; level: number }
  | { type: 'branch'; level: number; start: number; end: number };

export type TreePiece = {
  key: string;
  d: string;
  width: number;
  growth: PieceGrowth;
};

export type TreeLayout = {
  pieces: TreePiece[];
  bounds: { x: number; y: number; width: number; height: number };
};

type GrownPiece = Omit<TreePiece, 'd'> & { curve: Curve };

export const OUTLINE_WIDTH = 3;

const CROWN_HEIGHT = 26;
const DEFAULT_PAGES = 200;
const MARGIN = 4;
const TWIG_SEGMENTS = 3;

const pickBetween = (random: () => number, [min, max]: [number, number]) =>
  min + random() * (max - min);

function createTrunkPoints(
  species: TreeSpecies,
  levelCount: number,
  random: () => number,
) {
  const lean = (random() - 0.5) * species.trunkSway;
  const points: Point[] = [{ x: 0, y: 0 }];
  let height = species.firstLevel;
  for (let level = 0; level < levelCount; level++) {
    points.push({
      x: lean * (level + 1) * 0.6 + (random() - 0.5) * species.trunkSway,
      y: -height,
    });
    height += pickBetween(random, species.levelSpacing);
  }
  const top = points[points.length - 1];
  points.push({ x: top.x + lean * 0.8, y: top.y - CROWN_HEIGHT });
  return points;
}

const createTrunkPieces = (
  species: TreeSpecies,
  points: Point[],
  levelCount: number,
): GrownPiece[] =>
  createSmoothPieces(points, species.trunkWidths).map(
    ({ curve, width }, index) => ({
      key: `trunk-${index}`,
      curve,
      width,
      growth: {
        type: 'trunk',
        level: Math.max(0, Math.min(index, levelCount - 1)),
      },
    }),
  );

const createBranchPieces = (
  key: string,
  level: number,
  pieces: SmoothPiece[],
  [start, end] = [0, 1],
): GrownPiece[] =>
  pieces.map(({ curve, width, from, to }, index) => ({
    key: `${key}-${index}`,
    curve,
    width,
    growth: {
      type: 'branch',
      level,
      start: start + from * (end - start),
      end: start + to * (end - start),
    },
  }));

function growBranch(
  species: TreeSpecies,
  volume: Volume,
  level: number,
  attach: Point,
  side: number,
  random: () => number,
) {
  const length = species.measureLimb(volume.pages ?? DEFAULT_PAGES);
  const limbPoints = walkPath(
    attach,
    species.findStartAngle(side, random),
    length,
    species.limbSegments,
    (angle, index) => species.bendLimb(angle, index, random),
    random,
  );
  const limb = createBranchPieces(
    `${volume.id}-limb`,
    level,
    createSmoothPieces(limbPoints, species.limbWidths),
  );

  const [minTwigs, maxTwigs] = species.twigCount;
  const twigCount = minTwigs + Math.floor(random() * (maxTwigs - minTwigs + 1));
  const [, limbEndWidth] = species.limbWidths;
  const twigs = Array.from({ length: twigCount }, (_, twig) => {
    const fork = 0.35 + random() * 0.4;
    const { point, angle } = findPointAlong(limbPoints, fork);
    const twigPoints = walkPath(
      point,
      species.findTwigAngle(angle, random),
      length * (0.25 + random() * 0.15),
      TWIG_SEGMENTS,
      (twigAngle, index) => species.bendTwig(twigAngle, index, random),
      random,
    );
    return createBranchPieces(
      `${volume.id}-twig-${twig}`,
      level,
      createSmoothPieces(twigPoints, [limbEndWidth + 1.5, limbEndWidth - 0.5]),
      [fork, 1],
    );
  });

  return [...limb, ...twigs.flat()];
}

function measureBounds(pieces: GrownPiece[]) {
  const reach = Math.max(...pieces.map(({ width }) => width)) / 2;
  const padding = reach + OUTLINE_WIDTH + MARGIN;
  const points = pieces.flatMap(({ curve }) => curve);
  const halfWidth = roundCoordinate(
    Math.max(...points.map(({ x }) => Math.abs(x))) + padding,
  );
  const top = Math.min(...points.map(({ y }) => y)) - padding;
  const bottom = Math.max(0, ...points.map(({ y }) => y)) + padding;
  return {
    x: -halfWidth,
    y: roundCoordinate(top),
    width: halfWidth * 2,
    height: roundCoordinate(bottom - top),
  };
}

export function createTreeLayout(series: PrintSeries): TreeLayout {
  const species = TREE_SPECIES[series.type];
  const volumes = listByNumber(series.volumes);
  const random = createSeededRandom(series.id);
  let side = random() < 0.5 ? -1 : 1;
  const trunkPoints = createTrunkPoints(species, volumes.length, random);

  const branches = volumes.flatMap((volume, level) => {
    const branchRandom = createSeededRandom(`${series.id}-${volume.id}`);
    side = level === 0 || branchRandom() < 0.8 ? -side : side;
    return growBranch(
      species,
      volume,
      level,
      trunkPoints[level + 1],
      side,
      branchRandom,
    );
  });

  const pieces = [
    ...createTrunkPieces(species, trunkPoints, volumes.length),
    ...branches,
  ];

  return {
    pieces: pieces.map(({ curve, ...piece }) => ({
      ...piece,
      d: formatCurve(curve),
    })),
    bounds: measureBounds(pieces),
  };
}
