type VideoUrlTileProps = {
  name?: string;
  defaultValue?: string;
};

export function VideoUrlTile({
  name = 'url',
  defaultValue,
}: VideoUrlTileProps) {
  return (
    <div className="progress-tile url-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        🔗
      </span>
      <div className="tooltip" aria-hidden="true">
        URL
      </div>
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
