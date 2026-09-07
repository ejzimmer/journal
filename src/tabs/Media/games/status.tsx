import { SpaceInvaderIcon } from "../../../shared/icons/SpaceInvader"
import { StatusOption } from "../StatusField"
import { GameDetails } from "../types"

export type GameStatus = "not_started" | "in_progress" | "done"

export const GAME_STATUS_OPTIONS: StatusOption<GameStatus>[] = [
  {
    value: "not_started",
    emoji: <SpaceInvaderIcon strokeDasharray="12 4" />,
    label: "Not started",
  },
  { value: "in_progress", emoji: "🎮", label: "Playing" },
  { value: "done", emoji: "✔️", label: "Played" },
]

export const getGameStatus = ({ status }: GameDetails): GameStatus =>
  status ?? "not_started"

export const convertFromGameStatus = (
  status: GameStatus,
): Pick<GameDetails, "status"> => ({
  status: status === "not_started" ? null : status,
})
