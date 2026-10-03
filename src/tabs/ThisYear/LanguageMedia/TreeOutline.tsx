import { GrownShape } from './treeGrowth';
import { OUTLINE_WIDTH } from './treeLayout';
import { drawShapeOutline } from './treeShapePaths';

export function TreeOutline({ shapes }: { shapes: GrownShape[] }) {
  return (
    <g className="tree-outline">
      {shapes.map((shape) => (
        <path
          key={shape.key}
          d={drawShapeOutline(shape, shape.amount)}
          strokeWidth={OUTLINE_WIDTH * 2}
        />
      ))}
    </g>
  );
}
