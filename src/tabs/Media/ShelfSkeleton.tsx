export type ShelfSkeletonProps = { heights: number[]; hasLabel?: boolean };

export function ShelfSkeleton({ heights, hasLabel }: ShelfSkeletonProps) {
  return (
    <div className={`shelf${hasLabel ? '' : ' shelf-single'}`}>
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
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      )}
    </div>
  );
}
