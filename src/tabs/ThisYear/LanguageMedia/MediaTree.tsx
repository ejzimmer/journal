import { CSSProperties, useMemo } from 'react';
import { createTreeLayout } from './treeLayout';
import { TreeFill } from './TreeFill';
import { TreeSilhouette } from './TreeSilhouette';
import { Signpost } from './Signpost';
import { PrintSeries } from './types';

export function MediaTree({ series }: { series: PrintSeries }) {
  const layout = useMemo(() => createTreeLayout(series), [series]);
  const { x, y, width, height } = layout.bounds;

  return (
    <div
      className="media-tree"
      style={{ '--ground': `${y + height}px` } as CSSProperties}
    >
      <svg
        role="img"
        aria-label={series.name}
        viewBox={`${x} ${y} ${width} ${height}`}
        width={width}
        height={height}
      >
        <TreeSilhouette layout={layout} />
        <TreeFill layout={layout} series={series} />
      </svg>
      <Signpost name={series.name} />
    </div>
  );
}
