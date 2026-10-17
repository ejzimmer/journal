import { findBranchPoint } from './findBranchPoint';
import { Raceme } from './getRacemes';
import { TreeLayout } from './treeLayout';
import { WisteriaRaceme } from './WisteriaRaceme';

const SIDE_OFFSET = 2.5;

type VineRacemesProps = {
  layout: TreeLayout;
  racemes: Raceme[];
  highlightedKey?: string;
};

export function VineRacemes({
  layout,
  racemes,
  highlightedKey,
}: VineRacemesProps) {
  const findRacemeBase = (raceme: Raceme, side: number) => {
    const shoot = layout.shapes.find(({ key }) => key === raceme.shootKey);
    if (!shoot) return undefined;
    const point = findBranchPoint(shoot.edges, raceme.at);
    return { x: point.x + side * SIDE_OFFSET, y: point.y + 1 };
  };
  const floweringRacemes = racemes.flatMap(({ understood, ...raceme }) =>
    understood === undefined ? [] : [{ ...raceme, understood }],
  );
  const ghostRaceme = racemes.find(
    ({ key, understood }) => key === highlightedKey && understood === undefined,
  );
  const ghostBase = ghostRaceme && findRacemeBase(ghostRaceme, -1);

  return (
    <g className="vine-racemes">
      {floweringRacemes.map((raceme, index) => {
        const base = findRacemeBase(raceme, index % 2 ? 1 : -1);
        if (!base) return null;
        return (
          <WisteriaRaceme
            key={raceme.key}
            seed={raceme.key}
            base={base}
            understood={raceme.understood}
            className={
              raceme.key === highlightedKey ? 'highlighted' : undefined
            }
          />
        );
      })}
      {ghostRaceme && ghostBase && (
        <WisteriaRaceme
          seed={ghostRaceme.key}
          base={ghostBase}
          understood={100}
          className="highlighted ghost"
        />
      )}
    </g>
  );
}
