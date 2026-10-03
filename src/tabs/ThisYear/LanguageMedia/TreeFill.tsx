import { listByNumber } from './lists';
import { measurePieceGrowth } from './treeGrowth';
import { TreeLayout } from './treeLayout';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

type TreeFillProps = { layout: TreeLayout; series: PrintSeries };

export function TreeFill({ layout, series }: TreeFillProps) {
  const progress = listByNumber(series.volumes).map((volume) =>
    readVolumeProgress(series, volume),
  );
  const filledPieces = layout.pieces
    .map((piece) => ({
      ...piece,
      amount: measurePieceGrowth(piece.growth, progress),
    }))
    .filter(({ amount }) => amount > 0);

  return (
    <g className="tree-fill">
      {filledPieces.map(({ key, d, width, amount }) => (
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
