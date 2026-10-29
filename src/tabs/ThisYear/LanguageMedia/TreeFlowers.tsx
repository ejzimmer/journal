import { formatDayAndMonth, getLocalDate } from '../../../shared/dates';
import { CallistemonFlower } from './CallistemonFlower';
import { findBranchPoint } from './findBranchPoint';
import { Bloom } from './getBlooms';
import { findShootBase } from './growShoots';
import { HoverCloud } from './HoverCloud';
import { SakuraFlower } from './SakuraFlower';
import { TreeLayout } from './treeLayout';
import { PrintSeries } from './types';

const CALLISTEMON_TURNS = [60, 30];
const SAKURA_TURN = 55;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

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

        const side = index % 2 ? -downSide : downSide;

        return (
          <HoverCloud
            key={bloom.key}
            text={formatDayAndMonth(getLocalDate(bloom.date))}
          >
            {type === 'book' ? (
              <CallistemonFlower
                seed={bloom.key}
                base={findShootBase(point, downSide)}
                angle={point.angle + CALLISTEMON_TURNS[index % 2] * downSide}
                side={downSide}
                understood={bloom.understood}
              />
            ) : (
              <SakuraFlower
                seed={bloom.key}
                base={findShootBase(point, side)}
                angle={point.angle + SAKURA_TURN * side}
                understood={bloom.understood}
              />
            )}
          </HoverCloud>
        );
      })}
    </g>
  );
}
