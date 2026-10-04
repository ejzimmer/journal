import { listByNumber } from './lists';
import { TreeLayout } from './treeLayout';
import { drawShapeFill } from './treeShapePaths';
import { PrintSeries } from './types';

type BranchNamesProps = { layout: TreeLayout; series: PrintSeries };

export function BranchNames({ layout, series }: BranchNamesProps) {
  const volumes = listByNumber(series.volumes);
  const listBranchShapes = (level: number) =>
    layout.shapes.filter(
      ({ growth }) => growth.type === 'branch' && growth.level === level,
    );

  return (
    <g className="branch-names">
      {volumes.map(
        ({ id, name }, level) =>
          name && (
            <g key={id}>
              <title>{name}</title>
              {listBranchShapes(level).map(({ key, edges }) => (
                <path key={key} d={drawShapeFill(edges, 1)} />
              ))}
            </g>
          ),
      )}
    </g>
  );
}
