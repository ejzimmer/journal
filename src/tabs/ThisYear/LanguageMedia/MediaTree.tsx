import { CSSProperties, useMemo } from 'react';
import { createTreeLayout } from './treeLayout';
import { TreeFill } from './TreeFill';
import { measureTreeGrowth } from './treeGrowth';
import { TreeOutline } from './TreeOutline';
import { TreeSilhouette } from './TreeSilhouette';
import { Signpost } from './Signpost';
import { PrintSeries } from './types';

export function MediaTree({ series }: { series: PrintSeries }) {
  const layout = useMemo(() => createTreeLayout(series), [series]);
  const pieces = measureTreeGrowth(layout, series);
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
        <TreeFill pieces={pieces} />
        <TreeOutline bounds={layout.bounds} pieces={pieces} />
      </svg>
      <Signpost name={series.name} />
    </div>
  );
}
