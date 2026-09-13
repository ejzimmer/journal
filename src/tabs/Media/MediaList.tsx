import { ReactNode } from "react"
import { MediaDetails } from "./types"
import { MediaSpine, StatusConfig } from "./MediaSpine"

export function MediaList<T extends MediaDetails, S extends string>({
  items,
  bandHue,
  hue,
  config,
  editForm,
  loose,
}: {
  items?: Record<string, T>
  bandHue?: number
  hue: (item: T) => number
  config: StatusConfig<T, S>
  editForm: (
    item: T,
  ) => (props: { isOpen: boolean; onCancel: () => void }) => ReactNode
  loose?: boolean
}) {
  const itemDetails = items ? Object.values(items) : undefined

  return (
    itemDetails && (
      <ul className={`matched-set${loose ? " matched-set-loose" : ""}`}>
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
