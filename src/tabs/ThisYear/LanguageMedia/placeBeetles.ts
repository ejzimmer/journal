import { measureBranchLength } from './findBranchPoint';
import { LadyBeetleColour } from './LadyBeetle';
import { getItemsByNumber } from './lists';
import { EdgeSample } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { PrintSeries } from './types';

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

export function placeBeetles(
  series: PrintSeries,
  shapes: GrownShape[],
): BeetleSpot[] {
  return getItemsByNumber(series.volumes).flatMap((volume) => {
    const perches = shapes.filter(
      ({ key, amount }) =>
        key.startsWith(`${volume.id}-`) && amount > MIN_PERCH_AMOUNT,
    );
    if (!perches.length) return [];
    const colours = interleaveColours(
      volume.lookups,
      volume.aiQuestions,
    );
    const slots = Math.ceil(colours.length / perches.length);

    return colours.map((colour, index) => {
      const perch = perches[index % perches.length];
      const slot = Math.floor(index / perches.length);
      const range: [number, number] = [BASE_GAP, perch.amount - TIP_GAP];
      return {
        key: `${volume.id}-beetle-${index}`,
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
