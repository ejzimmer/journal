import { useEffect, useRef, useState } from "react"
import { CalendarTask, Task, WeeklyTask } from "./types"
import { PlusIcon } from "../../shared/icons/Plus"

type MissingProps = "id" | "lastUpdated" | "status"
type NewDailyTask = Omit<Task, MissingProps>
type NewWeeklyTask = Omit<WeeklyTask, MissingProps | "completed">
type NewCalendarTask = Omit<CalendarTask, MissingProps>

export type NewTask = NewDailyTask | NewWeeklyTask | NewCalendarTask

type AddTaskFormProps = {
  children: React.ReactNode
  onSubmit: () => boolean
}

export function AddTaskForm({ onSubmit, children }: AddTaskFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const formHeightRef = useRef(0)

  const [formVisible, setFormVisible] = useState(false)

  useEffect(() => {
    if (formRef.current) {
      formHeightRef.current = formRef.current.scrollHeight
    }
  }, [])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (onSubmit()) {
      setFormVisible(false)
    }
  }

  return (
    <>
      <button
        className={`icon subtle ${formVisible ? "form-visible" : ""}`}
        onClick={() => setFormVisible(!formVisible)}
      >
        <PlusIcon width="16px" />
      </button>
      <form
        ref={formRef}
        className={formVisible ? "visible" : ""}
        style={{ height: formVisible ? formHeightRef.current : 0 }}
        onSubmit={handleSubmit}
      >
        {children}
        <div className="buttons">
          <button type="submit" className="primary">
            Create
          </button>
          <button
            type="reset"
            className="white outline"
            onClick={() => setFormVisible(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
