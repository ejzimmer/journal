import { Books } from "./books/Books"
import { Games } from "./games/Games"
import { MediaStorageProvider } from "./MediaStorageContext"
import { useBandHueMigration } from "./useBandHueMigration"

import "./index.css"

function MediaShelves() {
  useBandHueMigration()

  return (
    <div className="media">
      <Books />
      <Games />
    </div>
  )
}

export function Media() {
  return (
    <MediaStorageProvider>
      <MediaShelves />
    </MediaStorageProvider>
  )
}
