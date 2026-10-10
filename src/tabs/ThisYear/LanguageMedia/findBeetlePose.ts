import { findBranchPoint } from './findBranchPoint';
import { EdgeSample } from './treeGeometry';

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const FOOT_SINK = 0.4;

export function findBeetlePose(
  edges: EdgeSample[],
  at: number,
  forward: boolean,
) {
  const point = findBranchPoint(edges, at);
  const angle = toRadians(point.angle);
  const upSide = Math.cos(angle) > 0 ? -1 : 1;
  const lift = (point.width / 2 - FOOT_SINK) * upSide;
  const heading = forward ? point.angle : point.angle + 180;
  return {
    x: point.x - Math.sin(angle) * lift,
    y: point.y + Math.cos(angle) * lift,
    heading,
    isUpsideDown: Math.cos(toRadians(heading)) < 0,
  };
}
