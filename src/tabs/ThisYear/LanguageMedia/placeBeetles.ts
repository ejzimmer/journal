import {
  createPerch,
  createTrunkPerch,
  interleaveColours,
  placeOnPerch,
  shareColours,
} from './beetlePerches';
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

type BeetleHost = Comprehension & { id: string };

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
