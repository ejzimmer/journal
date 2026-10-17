import { getItemsInAddedOrder } from './lists';
import { GrownShape } from './treeGrowth';
import { drawShapeFill } from './treeShapePaths';
import { Video, YoutubeChannel } from './types';
import { UpdateStretchButton } from './UpdateStretchButton';

type VideoArmsProps = {
  channel: YoutubeChannel;
  shapes: GrownShape[];
  onSelect: (video: Video) => void;
};

export function VideoArms({ channel, shapes, onSelect }: VideoArmsProps) {
  return (
    <g className="update-stretches">
      {getItemsInAddedOrder(channel.videos).flatMap((video) => {
        const arm = shapes.find(({ key }) => key === `${video.id}-arm`);
        if (!arm) return [];
        return (
          <UpdateStretchButton
            key={video.id}
            label={`Edit ${video.url}`}
            path={drawShapeFill(arm.edges, arm.amount)}
            onClick={() => onSelect(video)}
          />
        );
      })}
    </g>
  );
}
