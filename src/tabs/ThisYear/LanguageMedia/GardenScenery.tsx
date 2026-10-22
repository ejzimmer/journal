import { CSSProperties } from 'react';
import { GardenHills } from './GardenHills';
import { SkyBody } from './SkyBody';
import { SkyCloud } from './SkyCloud';
import { Stars } from './Stars';
import { findArcPosition } from './findArcPosition';

type GardenSceneryProps = {
  horizon: number;
  hour: number;
};

export function GardenScenery({ horizon, hour }: GardenSceneryProps) {
  const sun = findArcPosition(hour, 6, 19);
  const moon = findArcPosition(hour, 19, 6);

  return (
    <div
      className="garden-scenery"
      aria-hidden="true"
      style={{ '--horizon': `${horizon}px` } as CSSProperties}
    >
      <div className="sky">
        <Stars />
        {sun && <SkyBody className="sun" position={sun} />}
        {moon && <SkyBody className="moon" position={moon} />}
        <SkyCloud y="12%" scale={1} drift={0.1} />
        <SkyCloud y="34%" scale={0.7} drift={0.45} />
        <SkyCloud y="22%" scale={0.85} drift={0.8} />
        <GardenHills />
      </div>
      <div className="meadow" />
    </div>
  );
}
