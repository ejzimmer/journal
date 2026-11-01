import { useState } from 'react';
import { ModalDialog } from '../../../shared/controls/ModalDialog';
import { AddMediaForm } from './AddMediaForm';
import { CloudFrame } from './CloudFrame';
import { SeedlingIcon } from './SeedlingIcon';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';

export function AddMediaButton() {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="add-media-button tooltip-container">
      <button
        type="button"
        className="tooltip-anchor"
        {...triggerProps}
        aria-label="Add media"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <SeedlingIcon width="56px" />
      </button>
      <div className="tooltip" {...tooltipProps} aria-hidden="true">
        Add media
      </div>
      <ModalDialog
        isOpen={isOpen}
        className="progress-update-modal add-media-modal"
        onCancel={() => setIsOpen(false)}
      >
        {isOpen && (
          <CloudFrame>
            <AddMediaForm />
          </CloudFrame>
        )}
      </ModalDialog>
    </div>
  );
}
