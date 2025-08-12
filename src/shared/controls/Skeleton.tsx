import "./Skeleton.css"

export function Skeleton({ numRows }: { numRows: number }) {
  const rows = Array.from({ length: numRows })

  return (
    <div className="skeleton">
      <div>Loading...</div>
      {rows.map((_, i) => (
        <div
          key={i}
          className="row"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}
