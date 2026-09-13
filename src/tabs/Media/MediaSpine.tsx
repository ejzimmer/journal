import { ReactNode, useState } from "react"
import { MediaDetails } from "./types"
import { useMediaStorage } from "./MediaStorageContext"
import { Spine } from "./Spine"
import { getNextStatus } from "./nextStatus"

export type StatusConfig<T extends MediaDetails, S extends string> = {
  order: readonly S[]
  spineStatus: Record<S, "todo" | "active" | "done">
  glyph: Record<S, string>
  getStatus: (item: T) => S
  setStatus: (item: T, status: S) => T
  getAuthor?: (item: T) => string | undefined
}

function getSpineHeight(title: string) {
  return 178 + Math.min(34, Math.round(title.length * 1.5))
}

export function MediaSpine<T extends MediaDetails, S extends string>({
  item,
  bandHue,
  hue,
  config,
  editForm,
}: {
  item: T
  bandHue?: number
  hue: number
  config: StatusConfig<T, S>
  editForm: (props: { isOpen: boolean; onCancel: () => void }) => ReactNode
}) {
  const { updateMedia } = useMediaStorage()
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)

  const status = config.getStatus(item)
  const nextStatus = getNextStatus(config.order, status)
  const author = config.getAuthor?.(item)

  const updateStatus = () => {
    updateMedia(config.setStatus(item, nextStatus))
  }

  return (
    <Spine
      status={config.spineStatus[status]}
      hue={hue}
      bandHue={bandHue}
      minHeight={getSpineHeight(item.title)}
      title={item.title}
      author={author}
      glyph={config.glyph[status]}
      titleAriaLabel={`${item.title}${author ? `, ${author}` : ""}, ${status}`}
      stampAriaLabel={`${item.title}: ${status}. Change to ${nextStatus}`}
      onTitleClick={() => setIsEditFormOpen(true)}
      onStampClick={updateStatus}
    >
      {editForm({
        isOpen: isEditFormOpen,
        onCancel: () => setIsEditFormOpen(false),
      })}
    </Spine>
  )
}
