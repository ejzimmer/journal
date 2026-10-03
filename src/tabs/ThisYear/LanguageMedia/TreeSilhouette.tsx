import { TreeLayout } from './treeLayout';
import { drawShapeFill } from './treeShapePaths';

export function TreeSilhouette({ layout }: { layout: TreeLayout }) {
  return (
    <g className="tree-silhouette">
      {layout.shapes.map((shape) => (
        <path key={shape.key} d={drawShapeFill(shape.edges, 1)} />
      ))}
    </g>
  );
}
