import { Shoot } from './growShoots';
import { TreeLeaf } from './TreeLeaf';
import { drawShapeFill } from './treeShapePaths';
import { PrintSeries } from './types';

export function TreeShoot({
  shoot,
  type,
}: {
  shoot: Pick<Shoot, 'edges' | 'leaves'>;
  type: PrintSeries['type'];
}) {
  return (
    <g>
      <path className="tree-shoot" d={drawShapeFill(shoot.edges, 1)} />
      {shoot.leaves.map((leaf, index) => (
        <TreeLeaf key={index} leaf={leaf} type={type} />
      ))}
    </g>
  );
}
