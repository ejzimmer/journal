import { CSSProperties, useState } from 'react';
import { TreeFlowerIcon } from './TreeFlowerIcon';
import { PrintSeries } from './types';

export function UnderstoodTile({
  seriesType,
  understood,
}: {
  seriesType: PrintSeries['type'];
  understood?: number;
}) {
  const [value, setValue] = useState(understood);

  return (
    <div
      className={`progress-tile understood-tile ${seriesType} tooltip-container`}
    >
      <span className="flower-icon tooltip-anchor">
        <TreeFlowerIcon seriesType={seriesType} width="44px" />
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
