export function VideoUrlTile() {
  return (
    <div className="progress-tile url-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        🔗
      </span>
      <div className="tooltip" aria-hidden="true">
        URL
      </div>
      <input type="url" name="url" aria-label="URL" required />
    </div>
  );
}
