import { useState } from 'react';
import { ModalDialog } from '../../../shared/controls/ModalDialog';
import { PlusIcon } from '../../../shared/icons/Plus';
import { AddVolumeForm } from './AddVolumeForm';
import { CloudFrame } from './CloudFrame';
import { PrintSeries } from './types';

export function VolumeAdder({ series }: { series: PrintSeries }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="add-volume tooltip-container">
      <button
        type="button"
        className="tooltip-anchor"
        aria-label={`Add a volume to ${series.name}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon width="16px" />
      </button>
      <div className="tooltip" aria-hidden="true">
        Add volume
      </div>
      <ModalDialog
        isOpen={isOpen}
        className="progress-update-modal add-volume-modal"
        onCancel={() => setIsOpen(false)}
      >
        {isOpen && (
          <CloudFrame>
            <AddVolumeForm series={series} />
          </CloudFrame>
        )}
      </ModalDialog>
    </div>
  );
}
