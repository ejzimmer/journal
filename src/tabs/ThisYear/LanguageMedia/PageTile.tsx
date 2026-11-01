import { Tooltip } from '../../../shared/controls/Tooltip';

type PageTileProps = { page?: number; pages?: number };

export function PageTile({ page, pages }: PageTileProps) {
  return (
    <div className="progress-tile">
      <Tooltip className="page-icon" text="Page" aria-hidden="true">
        📖
      </Tooltip>
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
