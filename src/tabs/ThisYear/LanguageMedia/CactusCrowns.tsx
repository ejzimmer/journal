import { placeCrowns } from './placeCrowns';
import { SaguaroCrown } from './SaguaroCrown';
import { GrownShape } from './treeGrowth';
import { YoutubeChannel } from './types';

type CactusCrownsProps = { channel: YoutubeChannel; shapes: GrownShape[] };

export function CactusCrowns({ channel, shapes }: CactusCrownsProps) {
  return (
    <g className="cactus-crowns">
      {placeCrowns(channel, shapes).map((spot) => (
        <SaguaroCrown key={spot.key} spot={spot} />
      ))}
    </g>
  );
}
