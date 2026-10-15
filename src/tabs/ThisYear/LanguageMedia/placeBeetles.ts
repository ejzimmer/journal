import { measureBranchLength } from './findBranchPoint';
import { LadyBeetleColour } from './LadyBeetle';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { Comprehension } from './types';

export type BeetleSpot = {
  key: string;
  colour: LadyBeetleColour;
  edges: EdgeSample[];
  length: number;
  range: [number, number];
  at: number;
  forward: boolean;
};

const BASE_GAP = 0.12;
const TIP_GAP = 0.08;
const BEETLE_ROOM = 12;
const TRUNK_FOOT = 0.02;

type BeetleHost = Comprehension & { id: string };

type Perch = {
  shape: GrownShape;
  length: number;
  range: [number, number];
  colours: LadyBeetleColour[];
};

function interleaveColours(reds: number, yellows: number) {
  return Array.from({ length: Math.max(reds, yellows) }, (_, index) => [
    ...(index < reds ? ['red' as const] : []),
    ...(index < yellows ? ['yellow' as const] : []),
  ]).flat();
}

function createPerch(shape: GrownShape): Perch {
  return {
    shape,
    length: measureBranchLength(shape.edges),
    range: [BASE_GAP, shape.amount - TIP_GAP],
    colours: [],
  };
}

function measureRoom({ length, range: [min, max] }: Perch) {
  return Math.max(0, Math.floor(((max - min) * length) / BEETLE_ROOM));
}

function shareColours(perches: Perch[], colours: LadyBeetleColour[]) {
  const overflow: LadyBeetleColour[] = [];
  let next = 0;
  colours.forEach((colour) => {
    const withRoom = perches.filter(
      (perch) => perch.colours.length < measureRoom(perch),
    );
    if (!withRoom.length) {
      overflow.push(colour);
      return;
    }
    withRoom[next % withRoom.length].colours.push(colour);
    next++;
  });
  return overflow;
}

function findMiddle({ left, right }: EdgeSample) {
  return { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
}

function findNearestAt(edges: EdgeSample[], target: EdgeSample) {
  const { x, y } = findMiddle(target);
  const measureDistance = (sample: EdgeSample) => {
    const middle = findMiddle(sample);
    return Math.hypot(middle.x - x, middle.y - y);
  };
  return edges.reduce((nearest, sample) =>
    measureDistance(sample) < measureDistance(nearest) ? sample : nearest,
  ).at;
}

function createTrunkPerch(
  trunk: GrownShape,
  branch: GrownShape,
  colours: LadyBeetleColour[],
): Perch {
  const length = measureBranchLength(trunk.edges);
  const top = Math.min(
    trunk.amount,
    findNearestAt(trunk.edges, branch.edges[0]),
  );
  const bottom = Math.max(
    TRUNK_FOOT,
    top - (colours.length * BEETLE_ROOM) / length,
  );
  return { shape: trunk, length, range: [bottom, top], colours };
}

function placeOnPerch(
  { shape, length, range, colours }: Perch,
  keyPrefix: string,
): BeetleSpot[] {
  const [min, max] = range;
  return colours.map((colour, slot) => ({
    key: `${keyPrefix}-${slot}`,
    colour,
    edges: shape.edges,
    length,
    range,
    at: min + ((max - min) * (slot + 0.5)) / colours.length,
    forward: slot % 2 === 0,
  }));
}

export function placeBeetles(
  hosts: BeetleHost[],
  shapes: GrownShape[],
): BeetleSpot[] {
  const trunk = shapes.find(({ key }) => key === 'trunk');
  return hosts.flatMap((host) => {
    const hostShapes = shapes.filter(({ key }) =>
      key.startsWith(`${host.id}-`),
    );
    if (!hostShapes.length) return [];
    const perches = hostShapes.map(createPerch);
    const overflow = shareColours(
      perches,
      interleaveColours(host.lookups, host.aiQuestions),
    );
    const trunkPerches =
      trunk && overflow.length
        ? [createTrunkPerch(trunk, hostShapes[0], overflow)]
        : [];

    return [
      ...perches.flatMap((perch) =>
        placeOnPerch(perch, `${perch.shape.key}-beetle`),
      ),
      ...trunkPerches.flatMap((perch) =>
        placeOnPerch(perch, `${host.id}-trunk-beetle`),
      ),
    ];
  });
}
