import { GrownShape } from './treeGrowth';
import { drawShapeFill } from './treeShapePaths';

export function TreeFill({ shapes }: { shapes: GrownShape[] }) {
  return (
    <g className="tree-fill">
      {shapes.map((shape) => (
        <path key={shape.key} d={drawShapeFill(shape.edges, shape.amount)} />
      ))}
    </g>
  );
}
