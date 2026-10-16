import { CSSProperties, useState } from 'react';
import { MediaTypeIcon } from './MediaTypeIcon';
import { MediaType } from './types';

export function UnderstoodTile({ mediaType }: { mediaType: MediaType }) {
  const [value, setValue] = useState<number>();

  return (
    <div
      className={`progress-tile understood-tile ${mediaType} tooltip-container`}
    >
      <span className="flower-icon tooltip-anchor">
        <MediaTypeIcon type={mediaType} width="44px" />
      </span>
      <div className="tooltip" aria-hidden="true">
        Understood
      </div>
      <input
        type="range"
        name={value === undefined ? undefined : 'understood'}
        aria-label="Understood"
        min={0}
        max={100}
        value={value ?? 0}
        onChange={(event) => setValue(Number(event.target.value))}
        style={{ '--understood': `${value ?? 0}%` } as CSSProperties}
      />
    </div>
  );
}
