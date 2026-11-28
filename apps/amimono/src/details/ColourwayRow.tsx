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
      <span className="colourway-name">
        {colourway.photoUrl && (
          <img src={colourway.photoUrl} alt="" width="20" height="20" />
        )}
        {colourway.name}
      </span>
      <SkeinBalls skeins={colourway.skeins} />
    </div>
  );
}
