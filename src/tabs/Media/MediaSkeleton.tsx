import "./MediaSkeleton.css"

type ShelfSpec = { heights: number[]; hasLabel?: boolean }

const BOOK_SHELVES: ShelfSpec[] = [
  { heights: [182, 198, 172], hasLabel: true },
  { heights: [204, 188], hasLabel: true },
  { heights: [176] },
]

const GAME_SHELVES: ShelfSpec[] = [
  { heights: [190, 172, 200], hasLabel: true },
  { heights: [180] },
]

function ShelfSkeleton({ heights, hasLabel }: ShelfSpec) {
  return (
    <div className={`shelf${hasLabel ? "" : " shelf-single"}`}>
      <div className="spines">
        <ul className="matched-set">
          {heights.map((height, index) => (
            <li
              key={index}
              className="spine-skeleton"
              style={{
                width: 40 + (index % 3) * 6,
                minHeight: height,
                animationDelay: `${index * 0.15}s`,
              }}
            />
          ))}
        </ul>
      </div>
      {hasLabel && (
        <div className="shelf-label">
          <div
            className="shelf-label-skeleton"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      )}
    </div>
  )
}

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
  )
}
