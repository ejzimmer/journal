import { Bloom } from './getBlooms';
import { growShoots } from './growShoots';
import { GrownShape } from './treeGrowth';
import { TreeShoot } from './TreeShoot';
import { TREE_SPECIES } from './treeSpecies';
import { PrintSeries } from './types';

type TreeShootsProps = {
  shapes: GrownShape[];
  blooms: Bloom[];
  type: PrintSeries['type'];
};

export function TreeShoots({ shapes, blooms, type }: TreeShootsProps) {
  const shoots = shapes
    .filter(({ growth }) => growth.type === 'branch')
    .flatMap((shape) =>
      growShoots(
        shape,
        TREE_SPECIES[type].shoots,
        blooms
          .filter(({ limbKey }) => limbKey === shape.key)
          .map(({ at }) => at),
      ),
    );

  return (
    <g className="tree-shoots">
      {shoots.map((shoot) => (
        <TreeShoot key={shoot.key} shoot={shoot} type={type} />
      ))}
    </g>
  );
}
