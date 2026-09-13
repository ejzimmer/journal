import { GameDetails } from "../types"
import { EditMediaForm } from "../MediaForm"
import { useGameFormConfig } from "./gameFormConfig"

export function EditGameForm({
  game,
  isOpen,
  onCancel,
}: {
  game: GameDetails
  isOpen: boolean
  onCancel: () => void
}) {
  return (
    <EditMediaForm
      item={game}
      isOpen={isOpen}
      onCancel={onCancel}
      config={useGameFormConfig()}
    />
  )
}
