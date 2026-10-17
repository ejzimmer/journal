import { VineLeaf } from './placeVineLeaves';
import { WisteriaLeaf } from './WisteriaLeaf';

export function VineLeaves({ leaves }: { leaves: VineLeaf[] }) {
  return (
    <g className="vine-leaves">
      {leaves.map((leaf) => (
        <WisteriaLeaf key={leaf.key} leaf={leaf} />
      ))}
    </g>
  );
}
