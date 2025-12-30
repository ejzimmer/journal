import { Books } from "./books/Books"
import { Games } from "./games/Games"

import "./index.css"

export function Media() {
  return (
    <div className="media">
      <Books />
      <Games />
    </div>
  )
}
