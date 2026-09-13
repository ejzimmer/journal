import { Books } from "./books/Books"
import { Games } from "./games/Games"
import { MediaStorageProvider, useMediaStorage } from "./MediaStorageContext"
import { Skeleton } from "../../shared/controls/Skeleton"

import "./index.css"

export function Media() {
  return (
    <MediaStorageProvider>
      <MediaContent />
    </MediaStorageProvider>
  )
}

function MediaContent() {
  const { isLoading } = useMediaStorage()

  if (isLoading) {
    return <Skeleton numRows={2} />
  }

  return (
    <div className="media">
      <Books />
      <Games />
    </div>
  )
}
