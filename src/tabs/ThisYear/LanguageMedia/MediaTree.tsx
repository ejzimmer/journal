import { CSSProperties, useMemo, useState } from 'react';
import { ModalDialog } from '../../../shared/controls/ModalDialog';
import { BranchNames } from './BranchNames';
import { CloudFrame } from './CloudFrame';
import { findCurrentVolume } from './findCurrentVolume';
import { AddVolumeForm } from './AddVolumeForm';
import { ProgressUpdateForm } from './ProgressUpdateForm';
import { createTreeLayout } from './treeLayout';
import { TreeFill } from './TreeFill';
import { listGrownShapes } from './treeGrowth';
import { TreeOutline } from './TreeOutline';
import { TreeSilhouette } from './TreeSilhouette';
import { Signpost } from './Signpost';
import { PrintSeries } from './types';

export function MediaTree({ series }: { series: PrintSeries }) {
  const layout = useMemo(() => createTreeLayout(series), [series]);
  const grownShapes = listGrownShapes(layout, series);
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
        <TreeOutline shapes={grownShapes} />
        <TreeSilhouette layout={layout} />
        <TreeFill shapes={grownShapes} />
        {series.type === 'book' && (
          <BranchNames layout={layout} series={series} />
        )}
      </svg>
      <Signpost
        name={series.name}
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
