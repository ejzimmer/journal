import { listByNumber } from './lists';
import { createSeededRandom } from './seededRandom';
import {
  EdgeSample,
  findPointAlong,
  Point,
  roundCoordinate,
  SAMPLES_PER_CURVE,
  traceTaperedEdges,
  walkPath,
} from './treeGeometry';
import { TREE_SPECIES, TreeSpecies } from './treeSpecies';
import { PrintSeries, Volume } from './types';

export type ShapeGrowth =
  | { type: 'trunk'; levelEnds: number[] }
  | { type: 'branch'; level: number; start: number; end: number };

export type TreeShape = {
  key: string;
  edges: EdgeSample[];
  growth: ShapeGrowth;
};

export type TreeLayout = {
  shapes: TreeShape[];
  bounds: { x: number; y: number; width: number; height: number };
};

const CROWN_HEIGHT = 26;
const DEFAULT_PAGES = 200;
export const OUTLINE_WIDTH = 3;

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

function createTrunk(
  species: TreeSpecies,
  points: Point[],
  levelCount: number,
): TreeShape {
  const edges = traceTaperedEdges(points, species.trunkWidths);
  const levelEnds = Array.from({ length: levelCount }, (_, level) =>
    level === levelCount - 1 ? 1 : edges[(level + 1) * SAMPLES_PER_CURVE].at,
  );
  return { key: 'trunk', edges, growth: { type: 'trunk', levelEnds } };
}

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
  const limb: TreeShape = {
    key: `${volume.id}-limb`,
    edges: traceTaperedEdges(limbPoints, species.limbWidths),
    growth: { type: 'branch', level, start: 0, end: 1 },
  };

  const [minTwigs, maxTwigs] = species.twigCount;
  const twigCount = minTwigs + Math.floor(random() * (maxTwigs - minTwigs + 1));
  const [, limbEndWidth] = species.limbWidths;
  const twigs = Array.from({ length: twigCount }, (_, twig): TreeShape => {
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
    return {
      key: `${volume.id}-twig-${twig}`,
      edges: traceTaperedEdges(twigPoints, [
        limbEndWidth + 1.5,
        limbEndWidth - 0.5,
      ]),
      growth: { type: 'branch', level, start: fork, end: 1 },
    };
  });

  return [limb, ...twigs];
}

function measureBounds(shapes: TreeShape[]) {
  const edges = shapes.flatMap((shape) => shape.edges);
  const reach =
    Math.max(
      ...edges.map(({ left, right }) =>
        Math.hypot(left.x - right.x, left.y - right.y),
      ),
    ) / 2;
  const padding = reach + OUTLINE_WIDTH + MARGIN;
  const points = edges.flatMap(({ left, right }) => [left, right]);
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

  const shapes = [
    createTrunk(species, trunkPoints, volumes.length),
    ...branches,
  ];

  return { shapes, bounds: measureBounds(shapes) };
}
