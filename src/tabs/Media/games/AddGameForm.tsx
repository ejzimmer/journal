import { Modal } from "../../../shared/controls/Modal"
import { GameForm } from "./GameForm"

export function AddGameForm() {
  return (
    <Modal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label="Add a game">
          +
        </button>
      )}
    >
      <GameForm />
    </Modal>
  )
}
