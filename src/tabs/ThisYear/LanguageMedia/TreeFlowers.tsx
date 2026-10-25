import { CallistemonFlower } from './CallistemonFlower';
import { findBranchPoint } from './findBranchPoint';
import { Bloom } from './getBlooms';
import { findShootBase } from './growShoots';
import { SakuraFlower } from './SakuraFlower';
import { TreeLayout } from './treeLayout';
import { PrintSeries } from './types';
import { toRadians } from '../../../shared/toRadians';

const CALLISTEMON_TURNS = [60, 30];
const SAKURA_TURN = 55;

type TreeFlowersProps = {
  layout: TreeLayout;
  blooms: Bloom[];
  type: PrintSeries['type'];
};

export function TreeFlowers({ layout, blooms, type }: TreeFlowersProps) {
  return (
    <g className="tree-flowers">
      {blooms.map((bloom, index) => {
        const limb = layout.shapes.find(({ key }) => key === bloom.limbKey);
        if (!limb) return null;
        const point = findBranchPoint(limb.edges, bloom.at);
        const downSide = Math.cos(toRadians(point.angle)) >= 0 ? 1 : -1;

        if (type === 'book') {
          return (
            <CallistemonFlower
              key={bloom.key}
              seed={bloom.key}
              base={findShootBase(point, downSide)}
              angle={point.angle + CALLISTEMON_TURNS[index % 2] * downSide}
              side={downSide}
              understood={bloom.understood}
            />
          );
        }
        const side = index % 2 ? -downSide : downSide;
        return (
          <SakuraFlower
            key={bloom.key}
            seed={bloom.key}
            base={findShootBase(point, side)}
            angle={point.angle + SAKURA_TURN * side}
            understood={bloom.understood}
          />
        );
      })}
    </g>
  );
}
