import { useMemo } from 'react';
import { createCactusLayout } from './cactusLayout';
import { CactusRibs } from './CactusRibs';
import { CactusSpines } from './CactusSpines';
import { getItemsInAddedOrder } from './lists';
import { getGrownShapes } from './treeGrowth';
import { TreeFill } from './TreeFill';
import { TreeOutline } from './TreeOutline';
import { TreeSilhouette } from './TreeSilhouette';
import { YoutubeChannel } from './types';
import { readVideoProgress } from './videoProgress';

export function MediaCactus({ channel }: { channel: YoutubeChannel }) {
  const layout = useMemo(() => createCactusLayout(channel), [channel]);
  const progress = getItemsInAddedOrder(channel.videos).map(readVideoProgress);
  const grownShapes = getGrownShapes(layout, progress);
  const { x, y, width, height } = layout.bounds;

  return (
    <div className="media-tree media-cactus">
      <svg
        role="img"
        aria-label={channel.name}
        viewBox={`${x} ${y} ${width} ${height}`}
        width={width}
        height={height}
      >
        <CactusSpines shapes={grownShapes} />
        <TreeOutline shapes={grownShapes} />
        <TreeSilhouette layout={layout} />
        <TreeFill shapes={grownShapes} />
        <CactusRibs shapes={grownShapes} />
      </svg>
    </div>
  );
}
