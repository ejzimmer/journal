import { useRef, useState, useContext, useCallback } from "react"
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { PlusIcon } from "../../../shared/icons/Plus"
import { TrackerContext } from "./types"

type TrackersProps = {
  trackers?: string[]
  onUpdate: (trackers: string[]) => void
}

export function Trackers({ trackers, onUpdate }: TrackersProps) {
  return (
    <>
      {trackers?.map((tracker, index) => (
        <Tracker
          key={tracker + index}
          tracker={tracker}
          onDelete={() => {
            const firstIndex = trackers.findIndex((t) => t === tracker)
            onUpdate(trackers.toSpliced(firstIndex, 1))
          }}
        />
      ))}
      <AddTracker
        onSubmit={(tracker) => {
          onUpdate(trackers ? [...trackers, tracker] : [tracker])
        }}
      />
    </>
  )
}

function Tracker({
  tracker,
  onDelete,
}: {
  tracker: string
  onDelete: () => void
}) {
  return (
    <button
      className="subtle tracker"
      aria-label={`delete ${tracker}`}
      onClick={onDelete}
    >
      {tracker}
    </button>
  )
}

function AddTracker({ onSubmit }: { onSubmit: (tracker: string) => void }) {
  const comboboxRef = useRef<HTMLDivElement>(null)
  const [isAdding, setAdding] = useState(false)
  const trackers = useContext(TrackerContext)

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (!comboboxRef.current?.contains(event.target as HTMLElement)) {
      setAdding(false)
      window.removeEventListener("click", handleClickOutside)
    }
  }, [])

  const showCombobox = (event: React.MouseEvent) => {
    event.stopPropagation()
    setAdding(true)
    window.addEventListener("click", handleClickOutside)
  }

  return isAdding ? (
    <div ref={comboboxRef}>
      <Combobox
        value={{ id: "", label: "" }}
        options={trackers?.map((t) => ({ id: t, label: t })) ?? []}
        createOption={(label) => ({ id: label, label })}
        onChange={(tracker) => {
          onSubmit(tracker.label)
        }}
      />
    </div>
  ) : (
    <button className="icon ghost" onClick={showCombobox}>
      <PlusIcon width="16px" />
    </button>
  )
}
