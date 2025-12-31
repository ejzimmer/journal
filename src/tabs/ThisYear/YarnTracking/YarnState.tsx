import { YarnType } from "./types"

import "./YarnState.css"

type YarnStateProps = { total: number; yarns: Record<YarnType, number> }

export function YarnState({ yarns, total }: YarnStateProps) {
  return (
    <div style={{ flexGrow: 1 }}>
      <h2
        style={{
          fontSize: "18px",
          marginBlockStart: 0,
          marginBlockEnd: "12px",
          marginInline: "6px",
        }}
      >
        Now
      </h2>
      <div className="yarn-state">
        {Object.entries(yarns).map(([yarn, amount]) => (
          <div
            key={yarn}
            style={{
              width: (amount / total) * 100 + "%",
            }}
            tabIndex={0}
          >
            <div className="details">
              {yarn}: {amount.toLocaleString()}g
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
