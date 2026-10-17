import { findBranchPoint } from './findBranchPoint';
import { EdgeSample } from './treeGeometry';

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const FOOT_SINK = 0.4;

function findUpSide(edges: EdgeSample[]) {
  const { angle } = findBranchPoint(edges, 0);
  return Math.cos(toRadians(angle)) > 0 ? -1 : 1;
}

export function findBeetlePose(
  edges: EdgeSample[],
  at: number,
  forward: boolean,
) {
  const point = findBranchPoint(edges, at);
  const angle = toRadians(point.angle);
  const upSide = findUpSide(edges);
  const lift = (point.width / 2 - FOOT_SINK) * upSide;
  return {
    x: point.x - Math.sin(angle) * lift,
    y: point.y + Math.cos(angle) * lift,
    heading: forward ? point.angle : point.angle + 180,
    isUpsideDown: forward ? upSide === 1 : upSide === -1,
  };
}
