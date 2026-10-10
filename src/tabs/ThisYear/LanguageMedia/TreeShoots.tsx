import { growShoots } from './growShoots';
import { GrownShape } from './treeGrowth';
import { TreeShoot } from './TreeShoot';
import { TREE_SPECIES } from './treeSpecies';
import { PrintSeries } from './types';

export function TreeShoots({
  shapes,
  type,
}: {
  shapes: GrownShape[];
  type: PrintSeries['type'];
}) {
  const shoots = shapes
    .filter(({ growth }) => growth.type === 'branch')
    .flatMap((shape) => growShoots(shape, TREE_SPECIES[type].shoots));

  return (
    <g className="tree-shoots">
      {shoots.map((shoot) => (
        <TreeShoot key={shoot.key} shoot={shoot} type={type} />
      ))}
    </g>
  );
}
