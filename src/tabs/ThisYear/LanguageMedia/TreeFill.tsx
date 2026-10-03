import { TreeLayout } from './treeLayout';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

type TreeFillProps = { layout: TreeLayout; series: PrintSeries };

export function TreeFill({ layout, series }: TreeFillProps) {
  const progress = layout.levels.map(({ volume }) =>
    readVolumeProgress(series, volume),
  );
  const isStemGrown = (level: number) =>
    progress.slice(level).some((amount) => amount > 0);
  const filledParts = [
    ...layout.levels.flatMap(({ stem, branch }, level) => [
      { ...stem, amount: isStemGrown(level) ? 1 : 0 },
      { ...branch, amount: progress[level] },
    ]),
    { ...layout.crown, amount: progress.at(-1) ? 1 : 0 },
  ].filter(({ amount }) => amount > 0);

  return (
    <g className="tree-fill">
      {filledParts.map(({ key, d, width, amount }) => (
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
