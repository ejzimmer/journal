import { Colourway } from '../projects/types';
import { SkeinBalls } from './SkeinBalls';

type ColourwayRowProps = {
  colourway: Colourway;
};

export function ColourwayRow({ colourway }: ColourwayRowProps) {
  return (
    <div
      className="colourway-row"
      title={colourway.dyeLot ? `Dye lot ${colourway.dyeLot}` : undefined}
    >
      <span>{colourway.name}</span>
      <SkeinBalls skeins={colourway.skeins} />
    </div>
  );
}
