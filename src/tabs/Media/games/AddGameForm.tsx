import { AddMediaForm } from "../MediaForm"
import { useGameFormConfig } from "./gameFormConfig"

export function AddGameForm() {
  return <AddMediaForm ariaLabel="Add a game" config={useGameFormConfig()} />
}
