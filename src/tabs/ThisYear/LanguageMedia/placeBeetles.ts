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

function interleaveColours(reds: number, yellows: number) {
  return Array.from({ length: Math.max(reds, yellows) }, (_, index) => [
    ...(index < reds ? ['red' as const] : []),
    ...(index < yellows ? ['yellow' as const] : []),
  ]).flat();
}

type BeetleHost = Comprehension & { id: string };

export function placeBeetles(
  hosts: BeetleHost[],
  shapes: GrownShape[],
): BeetleSpot[] {
  return hosts.flatMap((host) => {
    const perches = shapes.filter(
      ({ key, amount }) =>
        key.startsWith(`${host.id}-`) && amount > MIN_PERCH_AMOUNT,
    );
    if (!perches.length) return [];
    const colours = interleaveColours(host.lookups, host.aiQuestions);
    const slots = Math.ceil(colours.length / perches.length);

    return colours.map((colour, index) => {
      const perch = perches[index % perches.length];
      const slot = Math.floor(index / perches.length);
      const range: [number, number] = [BASE_GAP, perch.amount - TIP_GAP];
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
