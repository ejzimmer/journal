import { Tooltip } from '../../../shared/controls/Tooltip';

export function EpisodeNameTile() {
  return (
    <div className="progress-tile url-tile">
      <Tooltip className="page-icon" text="Name" aria-hidden="true">
        🎬
      </Tooltip>
      <input name="name" aria-label="Name" />
    </div>
  );
}
