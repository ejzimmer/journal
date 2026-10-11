import { CSSProperties, useMemo, useState } from 'react';
import { ModalDialog } from '../../../shared/controls/ModalDialog';
import { BranchNames } from './BranchNames';
import { CloudFrame } from './CloudFrame';
import { findCurrentVolume } from './findCurrentVolume';
import { findSignpostPlacement } from './findSignpostPlacement';
import { getItemsByNumber } from './lists';
import { getBlooms } from './getBlooms';
import { AddVolumeForm } from './AddVolumeForm';
import { TreeBeetles } from './TreeBeetles';
import { ProgressUpdateForm } from './ProgressUpdateForm';
import { createTreeLayout } from './treeLayout';
import { TreeFill } from './TreeFill';
import { TreeFlowers } from './TreeFlowers';
import { getGrownShapes } from './treeGrowth';
import { TreeOutline } from './TreeOutline';
import { TreeShoots } from './TreeShoots';
import { TreeSilhouette } from './TreeSilhouette';
import { Signpost } from './Signpost';
import { PrintSeries } from './types';
import { readVolumeProgress } from './volumeProgress';

export function MediaTree({ series }: { series: PrintSeries }) {
  const layout = useMemo(() => createTreeLayout(series), [series]);
  const progress = getItemsByNumber(series.volumes).map((volume) =>
    readVolumeProgress(series, volume),
  );
  const grownShapes = getGrownShapes(layout, progress);
  const blooms = getBlooms(series);
  const [isProgressUpdateFormOpen, setIsProgressUpdateFormOpen] =
    useState(false);
  const currentVolume = findCurrentVolume(series);
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
        <TreeShoots shapes={grownShapes} blooms={blooms} type={series.type} />
        <TreeOutline shapes={grownShapes} />
        <TreeSilhouette layout={layout} />
        <TreeFill shapes={grownShapes} />
        <TreeFlowers layout={layout} blooms={blooms} type={series.type} />
        {series.type === 'book' && (
          <BranchNames layout={layout} series={series} />
        )}
        <TreeBeetles series={series} shapes={grownShapes} />
      </svg>
      <Signpost
        name={series.name}
        placement={findSignpostPlacement(layout)}
        isOpen={isProgressUpdateFormOpen}
        onClick={() => setIsProgressUpdateFormOpen((wasOpen) => !wasOpen)}
      />
      <ModalDialog
        isOpen={isProgressUpdateFormOpen}
        className="progress-update-modal"
        onCancel={() => setIsProgressUpdateFormOpen(false)}
      >
        {isProgressUpdateFormOpen && currentVolume && (
          <CloudFrame>
            <ProgressUpdateForm series={series} volume={currentVolume} />
          </CloudFrame>
        )}
      </ModalDialog>
      <AddVolumeForm series={series} />
    </div>
  );
}
