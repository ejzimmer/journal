import { Books } from "./books/Books"
import { Games } from "./games/Games"
import { MediaStorageProvider } from "./MediaStorageContext"

import "./index.css"

export function Media() {
  return (
    <MediaStorageProvider>
      <div className="media">
        <Books />
        <Games />
      </div>
    </MediaStorageProvider>
  )
}
