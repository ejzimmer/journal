import { Tooltip } from '../../../shared/controls/Tooltip';

type VideoUrlTileProps = {
  name?: string;
  defaultValue?: string;
};

export function VideoUrlTile({
  name = 'url',
  defaultValue,
}: VideoUrlTileProps) {
  return (
    <div className="progress-tile url-tile">
      <Tooltip className="page-icon" text="URL" aria-hidden="true">
        🔗
      </Tooltip>
      <input
        type="url"
        name={name}
        aria-label="URL"
        defaultValue={defaultValue}
        required
      />
    </div>
  );
}
