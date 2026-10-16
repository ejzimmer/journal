import { useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';

export function BookVolumeNames() {
  const [count, setCount] = useState(1);

  return (
    <div className="book-volume-names">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="volume-name-row tooltip-container">
          <span className="count-icon tooltip-anchor" aria-hidden="true">
            📕
          </span>
          <div className="tooltip" aria-hidden="true">
            Volume {index + 1}
          </div>
          <input
            name="volumeName"
            aria-label={`Volume ${index + 1}`}
            autoFocus={index > 0}
          />
        </div>
      ))}
      <div className="add-volume-name tooltip-container">
        <button
          type="button"
          className="tooltip-anchor"
          aria-label="Add another volume"
          onClick={() => setCount((previous) => previous + 1)}
        >
          <PlusIcon width="12px" strokeWidth="2.4" />
        </button>
        <div className="tooltip" aria-hidden="true">
          Add another volume
        </div>
      </div>
    </div>
  );
}
