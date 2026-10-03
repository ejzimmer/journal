import { useId } from 'react';
import { OUTLINE_WIDTH, TreeLayout } from './treeLayout';

export function TreeOutline({ layout }: { layout: TreeLayout }) {
  const maskId = useId();

  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" {...layout.bounds}>
        <rect {...layout.bounds} fill="white" />
        {layout.pieces.map(({ key, d, width }) => (
          <path
            key={key}
            d={d}
            fill="none"
            stroke="black"
            strokeWidth={width}
            strokeLinecap="round"
          />
        ))}
      </mask>
      <g className="tree-outline" mask={`url(#${maskId})`}>
        {layout.pieces.map(({ key, d, width }) => (
          <path
            key={key}
            d={d}
            strokeWidth={width + OUTLINE_WIDTH * 2}
            strokeLinecap="round"
          />
        ))}
      </g>
    </>
  );
}
