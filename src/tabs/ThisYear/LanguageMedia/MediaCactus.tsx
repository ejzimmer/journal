import { CSSProperties, useMemo, useState } from 'react';
import { ModalDialog } from '../../../shared/controls/ModalDialog';
import { CactusCrowns } from './CactusCrowns';
import { createCactusLayout } from './cactusLayout';
import { CactusRibs } from './CactusRibs';
import { CactusSpines } from './CactusSpines';
import { CloudFrame } from './CloudFrame';
import { findCurrentVideo } from './findCurrentVideo';
import { findSignpostPlacement } from './findSignpostPlacement';
import { getItemsInAddedOrder } from './lists';
import { Signpost } from './Signpost';
import { TreeBeetles } from './TreeBeetles';
import { getGrownShapes } from './treeGrowth';
import { TreeFill } from './TreeFill';
import { TreeOutline } from './TreeOutline';
import { TreeSilhouette } from './TreeSilhouette';
import { YoutubeChannel } from './types';
import { VideoUpdateForm } from './VideoUpdateForm';
import { readVideoProgress } from './videoProgress';

export function MediaCactus({ channel }: { channel: YoutubeChannel }) {
  const layout = useMemo(() => createCactusLayout(channel), [channel]);
  const videos = getItemsInAddedOrder(channel.videos);
  const progress = videos.map(readVideoProgress);
  const grownShapes = getGrownShapes(layout, progress);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const current = findCurrentVideo(channel);
  const { x, y, width, height } = layout.bounds;

  return (
    <div
      className="media-tree media-cactus"
      style={
        {
          '--ground': `${y + height}px`,
          '--tree-width': `${width}px`,
        } as CSSProperties
      }
    >
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
        <CactusCrowns channel={channel} shapes={grownShapes} />
        <TreeBeetles hosts={videos} shapes={grownShapes} />
      </svg>
      <Signpost
        name={channel.name}
        placement={findSignpostPlacement(layout)}
        isOpen={isUpdateFormOpen}
        onClick={() => setIsUpdateFormOpen((wasOpen) => !wasOpen)}
      />
      <ModalDialog
        isOpen={isUpdateFormOpen}
        className="progress-update-modal"
        onCancel={() => setIsUpdateFormOpen(false)}
      >
        {isUpdateFormOpen && current && (
          <CloudFrame>
            <VideoUpdateForm channel={channel} {...current} />
          </CloudFrame>
        )}
      </ModalDialog>
    </div>
  );
}
