type Point = [x: number, y: number];
type Puff = [cx: number, cy: number, radius: number];

const SIDES_TOP = 100;
const SIDE_SPACING = 60;
const TOP_EDGE_INSET = 14;
const BOTTOM_EDGE_OVERHANG = 40;
const CORNER_RADIUS = 40;

export function createCloudShape(width: number, height: number) {
  const sidesBottom = height - CORNER_RADIUS;
  const findEdge = (y: number) =>
    TOP_EDGE_INSET -
    ((y - SIDES_TOP) / (sidesBottom - SIDES_TOP)) *
      (TOP_EDGE_INSET + BOTTOM_EDGE_OVERHANG);
  const count = Math.max(
    3,
    Math.round((sidesBottom - SIDES_TOP) / SIDE_SPACING) + 1,
  );

  const getSidePuffs = (side: 'left' | 'right'): Puff[] =>
    Array.from({ length: count }, (_, index) => {
      const y = SIDES_TOP + ((sidesBottom - SIDES_TOP) * index) / (count - 1);
      const radius = index === count - 1 || index % 2 === 0 ? 40 : 34;
      const x = findEdge(y) + radius;
      return [side === 'left' ? x : width - x, y, radius];
    });

  const left = getSidePuffs('left');
  const right = getSidePuffs('right');
  const [topLeftX] = left[0];
  const [topRightX] = right[0];
  const [bottomLeftX] = left[left.length - 1];
  const [bottomRightX] = right[right.length - 1];

  const hull: Point[] = [
    [topLeftX, 60],
    [topRightX, 60],
    [bottomRightX, sidesBottom],
    [bottomRightX, height],
    [bottomLeftX, height],
    [bottomLeftX, sidesBottom],
  ];
  const puffs: Puff[] = [
    ...left,
    ...right,
    [70, 86, 52],
    [width - 72, 82, 54],
    [width * 0.3, 46, 60],
    [width / 2, 24, 72],
    [width * 0.7, 44, 60],
  ];

  return { hull, puffs };
}
