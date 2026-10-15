import { Beetle } from './Beetle';
import { BeetleSpot } from './placeBeetles';

export function TreeBeetles({ spots }: { spots: BeetleSpot[] }) {
  return (
    <g className="tree-beetles">
      {spots.map((spot) => (
        <Beetle key={spot.key} spot={spot} />
      ))}
    </g>
  );
}
