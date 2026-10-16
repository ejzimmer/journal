import { Video } from './types';
import { VideoLengthTile } from './VideoLengthTile';
import { VideoUrlTile } from './VideoUrlTile';

export function VideoRow({ video }: { video: Video }) {
  return (
    <div className="edit-video-row">
      <VideoUrlTile name={`url-${video.id}`} defaultValue={video.url} />
      <VideoLengthTile
        name={`length-${video.id}`}
        defaultValue={video.lengthInSeconds}
      />
    </div>
  );
}
