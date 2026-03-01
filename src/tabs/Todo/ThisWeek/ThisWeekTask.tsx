import { useContext } from "react"
import { EditableText } from "../../../shared/controls/EditableText"
import { DeleteButton } from "../DeleteButton"

import "./ThisWeekTask.css"
import { FirebaseContext } from "../../../shared/FirebaseContext"
import {
  DAILY_PATH,
  DayData,
  Habit,
  HABITS,
  isHabit,
  WEEKLY_KEY,
  WeeklyTask,
} from "../../../shared/types"
import { formatDate } from "../../../shared/utils"

const dateFormatter = Intl.DateTimeFormat("en-AU", {
  weekday: "short",
  day: "numeric",
})
const suffixes = ["th", "st", "nd", "3rd"]

const dateToWeekday = (date: number) => {
  const formatted = dateFormatter.format(new Date(date))
  const secondLastDigit = formatted.at(-2)
  const lastDigit = formatted.at(-1)
  const suffixIndex = lastDigit ? Number.parseInt(lastDigit) : -1

  if (secondLastDigit === "1") {
    return `${formatted}th`
  }

  return `${formatted}${suffixes[suffixIndex] ?? "th"}`
}

export function ThisWeekTask({ task }: { task: WeeklyTask }) {
  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }

  const onChange = (task: WeeklyTask) => {
    storageContext.updateItem<WeeklyTask>(WEEKLY_KEY, task)
  }

  const { day, month } = formatDate(new Date())
  const { value: today } = storageContext.useValue<Record<string, DayData>>(
    `${DAILY_PATH}/${day}${month}`,
  )

  const handleClick = (event: React.MouseEvent) => {
    if (!task.completed) {
      task.completed = []
    }

    if (event.shiftKey) {
      task.completed.pop()
      onChange({ ...task, completed: [...task.completed] })
    } else {
      const completed = Array.isArray(task.completed)
        ? task.completed
        : (Object.values(task.completed ?? {}) as number[])
      onChange({
        ...task,
        completed: [...completed.filter(Boolean), Date.now()],
      })
    }

    if (!isHabit(task.category.emoji)) {
      return
    }
    const habits =
      today?.habits ?? Object.fromEntries(HABITS.map((habit) => [habit, false]))
    storageContext.updateItem<DayData>(DAILY_PATH, {
      id: `${day}${month}`,
      habits: {
        ...habits,
        [task.category.emoji]: !event.shiftKey,
      } as Record<Habit, boolean>,
    })
  }

  const completed = Array.isArray(task.completed)
    ? task.completed
    : (Object.values(task.completed ?? {}) as number[])
  const numberDone = (completed.filter((date) => !!date) ?? []).length
  const remainder = Math.max(numberDone - task.frequency, 0)
  const percent = (1 / task.frequency) * 100

  return (
    <>
      <button onClick={handleClick} className="icon subtle">
        {task.category.emoji}
      </button>
      <div style={{ flexGrow: 1 }}>
        <EditableText
          label="description"
          onChange={(description) => onChange({ ...task, description })}
        >
          {task.description}
        </EditableText>
      </div>
      <div className="indicators">
        <progress
          max={task.frequency}
          value={numberDone}
          className={numberDone >= task.frequency ? "full" : ""}
          style={{
            backgroundColor: "#eee",
            backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${percent}%, var(--body-colour-light) ${percent}%, var(--body-colour-light) calc(${percent}% + 1px))`,
          }}
        />
        {remainder > 0 && <span className="remainder">+{remainder}</span>}
        {Array.isArray(task.completed) && (
          <ol className="dates-popover">
            {task.completed.map(
              (date) => date && <li key={date}>{dateToWeekday(date)}</li>,
            )}
          </ol>
        )}
      </div>
      <DeleteButton
        onDelete={() => storageContext.deleteItem<WeeklyTask>(WEEKLY_KEY, task)}
      />
    </>
  )
}
