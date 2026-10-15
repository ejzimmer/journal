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

const MIN_PERCH_AMOUNT = 0.2;
const BASE_GAP = 0.12;
const TIP_GAP = 0.08;
const SHORT_BASE_GAP = 0.3;
const SHORT_TIP_GAP = 0.2;

function interleaveColours(reds: number, yellows: number) {
  return Array.from({ length: Math.max(reds, yellows) }, (_, index) => [
    ...(index < reds ? ['red' as const] : []),
    ...(index < yellows ? ['yellow' as const] : []),
  ]).flat();
}

type BeetleHost = Comprehension & { id: string };

function findPerches(host: BeetleHost, shapes: GrownShape[]) {
  const hostShapes = shapes.filter(({ key }) => key.startsWith(`${host.id}-`));
  const roomyShapes = hostShapes.filter(
    ({ amount }) => amount > MIN_PERCH_AMOUNT,
  );
  if (roomyShapes.length || !hostShapes.length) return roomyShapes;
  return [hostShapes.reduce((a, b) => (b.amount > a.amount ? b : a))];
}

function measurePerchRange(amount: number): [number, number] {
  return [
    Math.min(BASE_GAP, amount * SHORT_BASE_GAP),
    amount - Math.min(TIP_GAP, amount * SHORT_TIP_GAP),
  ];
}

export function placeBeetles(
  hosts: BeetleHost[],
  shapes: GrownShape[],
): BeetleSpot[] {
  return hosts.flatMap((host) => {
    const perches = findPerches(host, shapes);
    if (!perches.length) return [];
    const colours = interleaveColours(host.lookups, host.aiQuestions);
    const slots = Math.ceil(colours.length / perches.length);

    return colours.map((colour, index) => {
      const perch = perches[index % perches.length];
      const slot = Math.floor(index / perches.length);
      const range = measurePerchRange(perch.amount);
      return {
        key: `${host.id}-beetle-${index}`,
        colour,
        edges: perch.edges,
        length: measureBranchLength(perch.edges),
        range,
        at: range[0] + ((range[1] - range[0]) * (slot + 0.5)) / slots,
        forward: (index + slot) % 2 === 0,
      };
    });
  });
}
