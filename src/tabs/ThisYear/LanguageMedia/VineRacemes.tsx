import { findBranchPoint } from './findBranchPoint';
import { Raceme } from './getRacemes';
import { TreeLayout } from './treeLayout';
import { WisteriaRaceme } from './WisteriaRaceme';

const SIDE_OFFSET = 2.5;

type VineRacemesProps = { layout: TreeLayout; racemes: Raceme[] };

export function VineRacemes({ layout, racemes }: VineRacemesProps) {
  return (
    <g className="vine-racemes">
      {racemes.map((raceme, index) => {
        const shoot = layout.shapes.find(({ key }) => key === raceme.shootKey);
        if (!shoot) return null;
        const point = findBranchPoint(shoot.edges, raceme.at);
        const side = index % 2 ? 1 : -1;
        return (
          <WisteriaRaceme
            key={raceme.key}
            seed={raceme.key}
            base={{ x: point.x + side * SIDE_OFFSET, y: point.y + 1 }}
            understood={raceme.understood}
          />
        );
      })}
    </g>
  );
}
