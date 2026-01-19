import { useContext } from "react"
import { EditableDate } from "../../../shared/controls/EditableDate"
import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import { CalendarTask, PARENT_LIST, STATUSES } from "./types"
import { differenceInDays, startOfDay } from "date-fns"
import { Switch } from "../../../shared/controls/Switch"
import { PlayButtonIcon } from "../../../shared/icons/PlayButton"
import { PauseButtonIcon } from "../../../shared/icons/PauseButton"
import { TickIcon } from "../../../shared/icons/Tick"
import { IconProps } from "../../../shared/icons/types"

const getDateClass = (task: CalendarTask) => {
  const today = startOfDay(Date.now())
  const dueDateDay = startOfDay(task.dueDate)
  if (dueDateDay < today) {
    return "past"
  }
  if (dueDateDay === today) {
    return "now"
  }

  if (differenceInDays(dueDateDay, today) <= 7) {
    return "this-week"
  }

  return ""
}

export function DueDateTask({ task }: { task: CalendarTask }) {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("Missing Firebase context provider")
  }

  const onChange = (task: CalendarTask) => context.updateItem(PARENT_LIST, task)
  const onDelete = () => {
    context.deleteItem<CalendarTask>(PARENT_LIST, task)
  }

  return (
    <>
      <EditableDate
        value={task.dueDate}
        onChange={(date) => onChange({ ...task, dueDate: date })}
        className={`due-date ${getDateClass(task)}`}
      />
      <div className="description">
        {task.category.emoji}
        <EditableText
          label="description"
          onChange={(description) => onChange({ ...task, description })}
        >
          {task.description}
        </EditableText>
      </div>
      <Switch
        options={[...STATUSES]}
        value={task.status}
        onChange={(status) =>
          onChange({ ...task, status, statusUpdateDate: new Date().getTime() })
        }
        name={task.description}
        Option={StatusOption}
      />
      <DeleteButton onDelete={onDelete} />
    </>
  )
}

const statusIconMapping: Record<CalendarTask["status"], React.FC<IconProps>> = {
  ready: PlayButtonIcon,
  paused: PauseButtonIcon,
  finished: TickIcon,
}

function StatusOption({ value }: { value: CalendarTask["status"] }) {
  const Icon = statusIconMapping[value]
  return <Icon colour="currentColor" width="12px" />
}
