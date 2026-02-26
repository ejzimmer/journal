import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { FirebaseContext } from "../../shared/FirebaseContext"
import { PlusIcon } from "../../shared/icons/Plus"
import { PROJECTS_KEY, ProjectDetails, Task } from "./types"
import { Subtask } from "./Subtask"
import { AddSubtaskForm } from "./AddSubtaskForm"

type SubtasksProps = {
  projectId: string
  isVisible: boolean
}

export function SubtaskList({ projectId, isVisible }: SubtasksProps) {
  const [formVisible, setFormVisible] = useState(false)
  const [containerHeight, setContainerHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const formContainerRef = useRef<HTMLDivElement>(null)
  const subtasksKey = `${PROJECTS_KEY}/${projectId}/subtasks`

  const storageContext = useContext(FirebaseContext)
  if (!storageContext) {
    throw new Error("Missing Firebase context provider")
  }
  const { value } = storageContext.useValue<Task>(subtasksKey)
  const subtasks = useMemo(() => (value ? Object.values(value) : []), [value])
  const { value: projects } =
    storageContext.useValue<ProjectDetails>(PROJECTS_KEY)

  const onUpdateTask = (task: Task) =>
    storageContext.updateItem<Task>(subtasksKey, task)

  const onDeleteTask = (task: Task) =>
    storageContext.deleteItem<Task>(subtasksKey, task)

  const onAddTask = (description: string) => {
    storageContext.addItem<Task>(subtasksKey, {
      description,
      status: "ready",
      category: projects?.[projectId].category ?? "",
    })
  }

  useEffect(() => {
    if (listRef.current && formContainerRef.current) {
      setContainerHeight(
        listRef.current.clientHeight + formContainerRef.current.clientHeight,
      )
    }
  }, [subtasks])

  return (
    <div
      className={`subtasks-section ${isVisible ? "visible" : ""}`}
      style={{ height: isVisible ? containerHeight : 0 }}
      ref={containerRef}
    >
      <ul className="subtasks" ref={listRef}>
        {subtasks.map((task) => (
          <Subtask
            key={task.id}
            {...task}
            onUpdate={onUpdateTask}
            onDelete={() => onDeleteTask(task)}
          />
        ))}
      </ul>
      <div
        ref={formContainerRef}
        style={{
          display: "flex",
          alignItems: "center",
          paddingInlineStart: "12px",
        }}
      >
        <AddSubtaskForm isFormVisible={formVisible} onAddSubtask={onAddTask} />
        <button
          className={`icon ghost show-form ${formVisible ? "form-visible" : ""}`}
          onClick={() => setFormVisible(!formVisible)}
        >
          <PlusIcon width="16px" colour="var(--action-colour)" />
        </button>
      </div>
    </div>
  )
}
