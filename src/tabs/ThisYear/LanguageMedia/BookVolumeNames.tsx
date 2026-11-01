import { useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';
import { VolumeNameField } from './VolumeNameField';

export function BookVolumeNames() {
  const [count, setCount] = useState(1);
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <div className="book-volume-names">
      {Array.from({ length: count }, (_, index) => (
        <VolumeNameField
          key={index}
          name="volumeName"
          label={`Volume ${index + 1}`}
          isFocused={index > 0}
        />
      ))}
      <div className="add-volume-name tooltip-container">
        <button
          type="button"
          className="tooltip-anchor"
          {...triggerProps}
          aria-label="Add another volume"
          onClick={() => setCount((previous) => previous + 1)}
        >
          <PlusIcon width="12px" strokeWidth="2.4" />
        </button>
        <div className="tooltip" {...tooltipProps} aria-hidden="true">
          Add another volume
        </div>
      </div>
    </div>
  );
}
