import { ReactNode, useState } from "react"
import { MediaDetails } from "./types"
import { useMediaStorage } from "./MediaStorageContext"
import { Spine } from "./Spine"
import { nextInCycle } from "./statusCycle"

export type StatusConfig<T extends MediaDetails, S extends string> = {
  order: readonly S[]
  spineStatus: Record<S, "todo" | "active" | "done">
  glyph: Record<S, string>
  getStatus: (item: T) => S
  applyStatus: (item: T, status: S) => T
  getSpineHeight: (title: string) => number
  getAuthor?: (item: T) => string | undefined
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
  const nextStatus = nextInCycle(config.order, status)
  const author = config.getAuthor?.(item)

  const cycleStatus = () => {
    updateMedia(config.applyStatus(item, nextStatus))
  }

  return (
    <Spine
      status={config.spineStatus[status]}
      hue={hue}
      bandHue={bandHue}
      minHeight={config.getSpineHeight(item.title)}
      title={item.title}
      author={author}
      glyph={config.glyph[status]}
      titleAriaLabel={`${item.title}${author ? `, ${author}` : ""}, ${status}`}
      stampAriaLabel={`${item.title}: ${status}. Change to ${nextStatus}`}
      onTitleClick={() => setIsEditFormOpen(true)}
      onStampClick={cycleStatus}
    >
      {editForm({
        isOpen: isEditFormOpen,
        onCancel: () => setIsEditFormOpen(false),
      })}
    </Spine>
  )
}

export function MediaList<T extends MediaDetails, S extends string>({
  items,
  bandHue,
  hue,
  config,
  editForm,
}: {
  items?: Record<string, T>
  bandHue?: number
  hue: (item: T) => number
  config: StatusConfig<T, S>
  editForm: (
    item: T,
  ) => (props: { isOpen: boolean; onCancel: () => void }) => ReactNode
}) {
  const itemDetails = items ? Object.values(items) : undefined

  return (
    itemDetails && (
      <ul className="matched-set">
        {itemDetails.map((item) => (
          <MediaSpine
            key={item.id}
            item={item}
            bandHue={bandHue}
            hue={hue(item)}
            config={config}
            editForm={editForm(item)}
          />
        ))}
      </ul>
    )
  )
}
