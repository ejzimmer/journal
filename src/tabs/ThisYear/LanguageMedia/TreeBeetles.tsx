import { Beetle } from './Beetle';
import { placeBeetles } from './placeBeetles';
import { GrownShape } from './treeGrowth';
import { Comprehension } from './types';

type TreeBeetlesProps = {
  hosts: (Comprehension & { id: string })[];
  shapes: GrownShape[];
};

export function TreeBeetles({ hosts, shapes }: TreeBeetlesProps) {
  return (
    <g className="tree-beetles">
      {placeBeetles(hosts, shapes).map((spot) => (
        <Beetle key={spot.key} spot={spot} />
      ))}
    </g>
  );
}
