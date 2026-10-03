import { TreeLayout } from './treeLayout';

export function TreeSilhouette({ layout }: { layout: TreeLayout }) {
  return (
    <g className="tree-silhouette">
      {layout.pieces.map(({ key, d, width }) => (
        <path key={key} d={d} strokeWidth={width} strokeLinecap="round" />
      ))}
    </g>
  );
}
