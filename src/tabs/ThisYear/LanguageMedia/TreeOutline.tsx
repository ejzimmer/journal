import { useId } from 'react';
import { GrownPiece } from './treeGrowth';
import { OUTLINE_WIDTH, TreeLayout } from './treeLayout';

type TreeOutlineProps = {
  bounds: TreeLayout['bounds'];
  pieces: GrownPiece[];
};

export function TreeOutline({ bounds, pieces }: TreeOutlineProps) {
  const maskId = useId();
  const outlineWidth = (width: number) => width + OUTLINE_WIDTH * 2;

  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" {...bounds}>
        <rect {...bounds} fill="white" />
        <g fill="none" stroke="black">
          {pieces.map(({ key, d, width }) => (
            <path key={key} d={d} strokeWidth={width} strokeLinecap="round" />
          ))}
          {pieces
            .filter(({ amount }) => amount < 1)
            .map(({ key, d, width, amount }) => (
              <path
                key={key}
                d={d}
                pathLength={1}
                strokeDasharray={`${1 - amount} 2`}
                strokeDashoffset={-amount}
                strokeWidth={outlineWidth(width) + 1}
              />
            ))}
        </g>
      </mask>
      <g className="tree-outline" mask={`url(#${maskId})`}>
        {pieces
          .filter(({ amount }) => amount > 0)
          .map(({ key, d, width, amount }) => (
            <path
              key={key}
              d={d}
              pathLength={1}
              strokeDasharray={`${amount} 2`}
              strokeWidth={outlineWidth(width)}
              strokeLinecap="round"
            />
          ))}
      </g>
    </>
  );
}
