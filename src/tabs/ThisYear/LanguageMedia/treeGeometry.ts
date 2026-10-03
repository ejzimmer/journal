export type Point = { x: number; y: number };

export type Curve = [Point, Point, Point, Point];

export type SmoothPiece = {
  curve: Curve;
  from: number;
  to: number;
  width: number;
};

const SAMPLES_PER_CURVE = 16;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const roundCoordinate = (value: number) => Math.round(value * 10) / 10;

export function turnToward(angle: number, target: number, amount: number) {
  const difference = ((target - angle + 540) % 360) - 180;
  return angle + difference * amount;
}

const stepToward = (point: Point, angle: number, length: number) => ({
  x: point.x + Math.cos(toRadians(angle)) * length,
  y: point.y + Math.sin(toRadians(angle)) * length,
});

export function walkPath(
  start: Point,
  angle: number,
  length: number,
  segments: number,
  bend: (angle: number, index: number) => number,
  random: () => number,
) {
  const points = [start];
  let direction = angle;
  for (let index = 0; index < segments; index++) {
    const stepLength = (length / segments) * (0.8 + random() * 0.4);
    points.push(stepToward(points[points.length - 1], direction, stepLength));
    direction = bend(direction, index);
  }
  return points;
}

const findPointOnCurve = ([p0, p1, p2, p3]: Curve, t: number) => {
  const u = 1 - t;
  const weights = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return {
    x:
      weights[0] * p0.x +
      weights[1] * p1.x +
      weights[2] * p2.x +
      weights[3] * p3.x,
    y:
      weights[0] * p0.y +
      weights[1] * p1.y +
      weights[2] * p2.y +
      weights[3] * p3.y,
  };
};

export function measureCurve(curve: Curve) {
  let length = 0;
  let previous = curve[0];
  for (let sample = 1; sample <= SAMPLES_PER_CURVE; sample++) {
    const point = findPointOnCurve(curve, sample / SAMPLES_PER_CURVE);
    length += Math.hypot(point.x - previous.x, point.y - previous.y);
    previous = point;
  }
  return length;
}

const createSmoothCurve = (points: Point[], index: number): Curve => {
  const p0 = points[index - 1] ?? points[index];
  const p1 = points[index];
  const p2 = points[index + 1];
  const p3 = points[index + 2] ?? p2;
  return [
    p1,
    { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
    { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
    p2,
  ];
};

export function createSmoothPieces(
  points: Point[],
  [startWidth, endWidth]: [number, number],
): SmoothPiece[] {
  const curves = points
    .slice(1)
    .map((_, index) => createSmoothCurve(points, index));
  const lengths = curves.map(measureCurve);
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const lastIndex = Math.max(curves.length - 1, 1);
  let travelled = 0;
  return curves.map((curve, index) => {
    const from = travelled / total;
    travelled += lengths[index];
    return {
      curve,
      from,
      to: travelled / total,
      width: startWidth + (endWidth - startWidth) * (index / lastIndex),
    };
  });
}

export function findPointAlong(points: Point[], fraction: number) {
  const position = fraction * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(position));
  const t = position - index;
  const a = points[index];
  const b = points[index + 1];
  return {
    point: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
    angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
  };
}

export const formatCurve = ([start, ...controls]: Curve) =>
  `M${roundCoordinate(start.x)} ${roundCoordinate(start.y)} C${controls
    .map(({ x, y }) => `${roundCoordinate(x)} ${roundCoordinate(y)}`)
    .join(' ')}`;
