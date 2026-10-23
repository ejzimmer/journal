import { CSSProperties } from 'react';
import { Dinosaur } from './Dinosaur';
import { GardenHills } from './GardenHills';
import { SkyCloud } from './SkyCloud';

type GardenSceneryProps = {
  horizon: number;
};

export function GardenScenery({ horizon }: GardenSceneryProps) {
  return (
    <div
      className="garden-scenery"
      aria-hidden="true"
      style={{ '--horizon': `${horizon}px` } as CSSProperties}
    >
      <div className="sky">
        <div className="sun" />
        <SkyCloud x="12%" y="18%" scale={1} />
        <SkyCloud x="55%" y="40%" scale={0.7} />
        <GardenHills />
        <Dinosaur />
      </div>
      <div className="meadow" />
    </div>
  );
}
