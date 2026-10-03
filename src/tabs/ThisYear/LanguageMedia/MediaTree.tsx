import { CSSProperties, useMemo } from 'react';
import { createTreeLayout } from './treeLayout';
import { TreeFill } from './TreeFill';
import { TreeOutline } from './TreeOutline';
import { Signpost } from './Signpost';
import { PrintSeries } from './types';

export function MediaTree({ series }: { series: PrintSeries }) {
  const layout = useMemo(
    () => createTreeLayout(series.volumes),
    [series.volumes],
  );
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
        <TreeFill layout={layout} series={series} />
        <TreeOutline layout={layout} />
      </svg>
      <Signpost name={series.name} />
    </div>
  );
}
