export function PageTile({ page, pages }: { page?: number; pages?: number }) {
  return (
    <div className="progress-tile tooltip-container">
      <span className="page-icon tooltip-anchor" aria-hidden="true">
        📖
      </span>
      <div className="tooltip" aria-hidden="true">
        Page
      </div>
      <input
        type="number"
        name="page"
        aria-label="Page"
        defaultValue={page}
        min={0}
        max={pages}
      />
      {pages && <span className="page-total">/ {pages}</span>}
    </div>
  );
}
