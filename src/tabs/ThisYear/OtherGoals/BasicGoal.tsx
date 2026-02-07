import { Switch } from "../../../shared/controls/Switch"
import { PauseButtonIcon } from "../../../shared/icons/PauseButton"
import { PlayButtonIcon } from "../../../shared/icons/PlayButton"
import { TickIcon } from "../../../shared/icons/Tick"
import { IconProps } from "../../../shared/icons/types"

const STATUSES = ["ready", "in_progress", "done"] as const
export type BasicGoalData = {
  id?: string
  description: string
  status: (typeof STATUSES)[number]
}

type BasicGoalProps = {
  goal: BasicGoalData
  onChange: (goal: BasicGoalData) => void
}

export function BasicGoal({ goal, onChange }: BasicGoalProps) {
  return (
    <div className={`basic-goal ${goal.status}`}>
      <Switch
        options={[...STATUSES]}
        value={goal.status}
        onChange={(status) =>
          onChange({
            ...goal,
            status,
          })
        }
        name={goal.description}
        Option={StatusOption}
      />
      {goal.description}
    </div>
  )
}

const statusIconMapping: Record<
  BasicGoalData["status"],
  React.FC<IconProps>
> = {
  ready: PauseButtonIcon,
  in_progress: PlayButtonIcon,
  done: TickIcon,
}

function StatusOption({ value }: { value: BasicGoalData["status"] }) {
  const Icon = statusIconMapping[value]
  return <Icon colour="currentColor" width="12px" />
}
