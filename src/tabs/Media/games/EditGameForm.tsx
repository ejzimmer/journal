import { GameDetails } from "../types"
import { ModalDialog } from "../../../shared/controls/ModalDialog"
import { GameForm } from "./GameForm"

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
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      <GameForm game={game} />
    </ModalDialog>
  )
}
