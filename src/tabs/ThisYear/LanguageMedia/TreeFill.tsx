import { GrownPiece } from './treeGrowth';

export function TreeFill({ pieces }: { pieces: GrownPiece[] }) {
  return (
    <g className="tree-fill">
      {pieces
        .filter(({ amount }) => amount > 0)
        .map(({ key, d, width, amount }) => (
          <path
            key={key}
            d={d}
            pathLength={1}
            strokeDasharray={`${amount} 2`}
            strokeWidth={width}
            strokeLinecap="round"
          />
        ))}
    </g>
  );
}
