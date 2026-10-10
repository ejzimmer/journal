import { Bottlebrush } from './Bottlebrush';
import { findBranchPoint, measureBranchLength } from './findBranchPoint';
import { growShoot } from './growShoots';
import { createSeededRandom } from './seededRandom';
import { Point } from './treeGeometry';
import { TreeShoot } from './TreeShoot';
import { TREE_SPECIES } from './treeSpecies';

const TWIG_LENGTH = 26;
const STEM_LENGTH = 46;
const FORK_AT = 0.7;
const STEM_TURN = 30;
const BRUSH_END = 0.86;

const SHOOTS = TREE_SPECIES.book.shoots;
const TWIG_STYLE = {
  ...SHOOTS,
  widths: [2.2, 1.3] as [number, number],
  bend: 0.05,
};
const STEM_STYLE = {
  ...SHOOTS,
  widths: [0.8, 0.5] as [number, number],
  bend: 0.22,
};

type CallistemonFlowerProps = {
  seed: string;
  base: Point;
  angle: number;
  side: number;
  understood: number;
};

export function CallistemonFlower({
  seed,
  base,
  angle,
  side,
  understood,
}: CallistemonFlowerProps) {
  const random = createSeededRandom(seed);
  const twig = growShoot(base, angle, TWIG_LENGTH, TWIG_STYLE, random);
  const fork = findBranchPoint(twig.edges, FORK_AT);
  const stem = growShoot(
    fork,
    fork.angle + STEM_TURN * side,
    STEM_LENGTH,
    STEM_STYLE,
    random,
    [
      [0.12, 0.2],
      [0.84, 1],
    ],
  );

  return (
    <g className="callistemon-flower">
      <TreeShoot shoot={twig} type="book" />
      <TreeShoot shoot={stem} type="book" />
      <Bottlebrush
        edges={stem.edges}
        length={measureBranchLength(stem.edges)}
        endAt={BRUSH_END}
        understood={understood}
      />
    </g>
  );
}
