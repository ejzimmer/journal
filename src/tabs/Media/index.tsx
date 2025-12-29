import { Books } from "./books/Books"
import { Games } from "./Games"

export function Media() {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <Books />
      <Games />
    </div>
  )
}
