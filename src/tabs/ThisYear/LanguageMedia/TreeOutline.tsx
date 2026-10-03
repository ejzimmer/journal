import { useId } from 'react';
import { listTreeParts, OUTLINE_WIDTH, TreeLayout } from './treeLayout';

export function TreeOutline({ layout }: { layout: TreeLayout }) {
  const maskId = useId();
  const parts = listTreeParts(layout);

  return (
    <>
      <mask id={maskId} maskUnits="userSpaceOnUse" {...layout.bounds}>
        <rect {...layout.bounds} fill="white" />
        {parts.map(({ key, d, width }) => (
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
        {parts.map(({ key, d, width }) => (
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
