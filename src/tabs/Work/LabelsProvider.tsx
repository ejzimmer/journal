import { ReactNode, useContext, useEffect, useMemo } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { LabelsContext } from "./LabelsContext"
import { Label, LABELS_KEY } from "./types"

export function LabelsProvider({
  usedLabelIds,
  children,
}: {
  usedLabelIds: Set<string>
  children: ReactNode
}) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("missing storage context")
  }
  const { updateItem, useValue } = storageContext
  const { value: labelsById } = useValue<Record<string, Label>>(LABELS_KEY)

  const labels = useMemo(() => Object.values(labelsById ?? {}), [labelsById])

  useEffect(() => {
    labels.forEach((storedLabel) => {
      const isUsed = usedLabelIds.has(storedLabel.id)
      if (isUsed && storedLabel.lastRemoved !== undefined) {
        const { lastRemoved, ...withoutLastRemoved } = storedLabel
        updateItem(LABELS_KEY, withoutLastRemoved)
      } else if (!isUsed && storedLabel.lastRemoved === undefined) {
        updateItem(LABELS_KEY, { ...storedLabel, lastRemoved: Date.now() })
      }
    })
  }, [labels, usedLabelIds, updateItem])

  return (
    <LabelsContext.Provider value={labels}>{children}</LabelsContext.Provider>
  )
}
