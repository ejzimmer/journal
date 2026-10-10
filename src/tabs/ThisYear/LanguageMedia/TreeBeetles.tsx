import { Beetle } from './Beetle';
import { placeBeetles } from './placeBeetles';
import { GrownShape } from './treeGrowth';
import { PrintSeries } from './types';

export function TreeBeetles({
  series,
  shapes,
}: {
  series: PrintSeries;
  shapes: GrownShape[];
}) {
  return (
    <g className="tree-beetles">
      {placeBeetles(series, shapes).map((spot) => (
        <Beetle key={spot.key} spot={spot} />
      ))}
    </g>
  );
}
