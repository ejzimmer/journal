export function EpisodeNameTile() {
  return (
    <div className="progress-tile url-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        🎬
      </span>
      <div className="tooltip" aria-hidden="true">
        Name
      </div>
      <input name="name" aria-label="Name" />
    </div>
  );
}
