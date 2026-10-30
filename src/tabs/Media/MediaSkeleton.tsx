import './MediaSkeleton.css';
import { ShelfSkeleton, ShelfSkeletonProps } from './ShelfSkeleton';

const BOOK_SHELVES: ShelfSkeletonProps[] = [
  { heights: [182, 198, 172], hasLabel: true },
  { heights: [204, 188], hasLabel: true },
  { heights: [176] },
];

const GAME_SHELVES: ShelfSkeletonProps[] = [
  { heights: [190, 172, 200], hasLabel: true },
  { heights: [180] },
];

export function MediaSkeleton() {
  return (
    <div className="media">
      <span className="media-skeleton-label">
        Loading your books and games…
      </span>
      <div className="books">
        <h2>Books</h2>
        <div className="shelves">
          {BOOK_SHELVES.map((shelf, index) => (
            <ShelfSkeleton key={index} {...shelf} />
          ))}
        </div>
      </div>
      <div className="games">
        <h2>Games</h2>
        <div className="shelves">
          {GAME_SHELVES.map((shelf, index) => (
            <ShelfSkeleton key={index} {...shelf} />
          ))}
        </div>
      </div>
    </div>
  );
}
