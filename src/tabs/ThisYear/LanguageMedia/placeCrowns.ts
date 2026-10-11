import { findBranchPoint } from './findBranchPoint';
import { getItemsInAddedOrder } from './lists';
import { roundCoordinate } from './treeGeometry';
import { GrownShape } from './treeGrowth';
import { YoutubeChannel } from './types';

const SINK = 2;

export type CrownSpot = {
  key: string;
  x: number;
  y: number;
  angle: number;
  understood: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export function placeCrowns(
  channel: YoutubeChannel,
  shapes: GrownShape[],
): CrownSpot[] {
  return getItemsInAddedOrder(channel.videos).flatMap((video) => {
    const arm = shapes.find(({ key }) => key === `${video.id}-arm`);
    if (!arm || video.understood === undefined) return [];
    const tip = findBranchPoint(arm.edges, arm.amount);
    const reach = tip.width / 2 - SINK;
    return [
      {
        key: `${video.id}-crown`,
        x: roundCoordinate(tip.x + Math.cos(toRadians(tip.angle)) * reach),
        y: roundCoordinate(tip.y + Math.sin(toRadians(tip.angle)) * reach),
        angle: roundCoordinate(tip.angle),
        understood: video.understood,
      },
    ];
  });
}
