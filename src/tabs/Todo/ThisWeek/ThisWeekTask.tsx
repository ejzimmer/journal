import { FormEvent, useContext, useMemo, useRef, useState } from "react"

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
import { Combobox } from "../../../shared/controls/combobox/Combobox"
import { CategoriesContext } from ".."
import { ProgressIndicator } from "./ProgressIndicator"

export function ThisWeekTask({ task }: { task: WeeklyTask }) {
  const [inEditMode, setInEditMode] = useState(false)
  const switchToViewMode = () => setInEditMode(false)
  const switchToEditMode = () => setInEditMode(true)

  const descriptionRef = useRef<HTMLInputElement>(null)
  const frequencyRef = useRef<HTMLInputElement>(null)

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const onChange = (task: WeeklyTask) => {
    storageContext.updateItem<WeeklyTask>(WEEKLY_KEY, task)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!descriptionRef.current || !frequencyRef.current) {
      return
    }

    const description = descriptionRef.current.value
    if (!description) {
      storageContext.deleteItem<WeeklyTask>(WEEKLY_KEY, task)
      return
    }

    const frequency = Number.parseInt(frequencyRef.current.value)
    if (
      description === task.description &&
      (frequency === task.frequency || isNaN(frequency))
    ) {
      switchToViewMode()
      return
    }

    storageContext.updateItem<WeeklyTask>(WEEKLY_KEY, {
      ...task,
      description: descriptionRef.current.value,
      frequency: isNaN(frequency) ? task.frequency : frequency,
    })

    switchToViewMode()
  }

  const categories = useContext(CategoriesContext)
  if (!categories) {
    throw new Error("Missing categories context provider")
  }
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category, label: category })),
    [categories],
  )

  const { day, month } = formatDate(new Date())
  const { value: today } = storageContext.useValue<Record<string, DayData>>(
    `${DAILY_PATH}/${day}${month}`,
  )

  const handleClick = (event: React.MouseEvent) => {
    if (!task.completed) {
      task.completed = []
    }

    if (event.shiftKey) {
      onChange({ ...task, completed: task.completed.slice(0, -1) })
    } else {
      const completed = Array.isArray(task.completed)
        ? task.completed
        : (Object.values(task.completed ?? {}) as number[])
      onChange({
        ...task,
        completed: [...completed.filter(Boolean), Date.now()],
      })
    }

    if (!isHabit(task.category)) {
      return
    }
    const habits =
      today?.habits ?? Object.fromEntries(HABITS.map((habit) => [habit, false]))
    storageContext.updateItem<DayData>(DAILY_PATH, {
      id: `${day}${month}`,
      habits: {
        ...habits,
        [task.category]: !event.shiftKey,
      } as Record<Habit, boolean>,
    })
  }

  const handleClose = ({ key }: React.KeyboardEvent<HTMLFormElement>) => {
    if (key === "Escape") {
      switchToViewMode()
    }
  }

  if (inEditMode) {
    return (
      <form
        className="edit-this-week-task"
        onSubmit={onSubmit}
        onKeyDown={handleClose}
      >
        <Combobox
          value={{ id: task.category, label: task.category }}
          options={categoryOptions}
          createOption={(value) => ({ id: value, label: value })}
          onChange={(value) => {
            onChange({ ...task, category: value.id })
            switchToViewMode()
          }}
          inputSize={1}
          ariaLabel="Category"
        />
        <input
          ref={descriptionRef}
          aria-label="Description"
          defaultValue={task.description}
        />
        <input
          ref={frequencyRef}
          type="number"
          aria-label="Frequency"
          defaultValue={task.frequency}
          size={2}
        />
        <button>submit</button>
      </form>
    )
  }

  return (
    <>
      <button onClick={handleClick} className="icon subtle">
        {task.category}
      </button>
      <div style={{ flexGrow: 1 }}>
        <div tabIndex={0} onClick={switchToEditMode}>
          {task.description}
        </div>
      </div>
      <ProgressIndicator
        completed={task.completed}
        frequency={task.frequency}
      />
    </>
  )
}
